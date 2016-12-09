
const moment = require('moment');
const utf8 = require('utf8');
const hDuration = require('humanize-duration');

cvars.ServerVar('name_notify', '0', [FCVAR_BOOLONLY], 'Enable nickname changes notifications');

setInterval(function() {
	let finalQuery = 'BEGIN;';
	
	for (let member of DBot.GetMembers()) {
		try {
			let name = member.nickname || member.user.username;
			
			member.oldNickname = member.oldNickname || name;
			
			let notifications = cvars.Server(member.guild).getVar('notifications').getBool();
			let name_notify = cvars.Server(member.guild).getVar('name_notify').getBool();
			
			if (member.oldNickname != name) {
				if (notifications && name_notify) {
					let channel = DBot.GetNotificationChannel(member.guild);
					
					if (channel) {
						channel.sendMessage('```\nUser @' + member.oldNickname + ' (@' + member.user.username + ') has changes his nick to @' + name + '\n```');
					}
				}
				
				finalQuery += 'UPDATE member_names SET "NAME" = ' + Util.escape(name) + ' WHERE "ID" = ' + member.uid + ';';
			}
			
			member.oldNickname = name;
		} catch(err) {
			console.error(err);
		}
	}
	
	finalQuery += 'SELECT update_nicknames_stats(' + Math.floor(CurTime()) + ');COMMIT;';
	
	Postgres.query(finalQuery, function(err) {
		if (err) {
			console.error(err);
			console.error('OOPS, unable to update nicknames!');
		}
	});
}, 10000);

hook.Add('MemberInitialized', 'MemberNameLogs', function(member) {
	let name = Util.escape(member.nickname || member.user.username);
	member.oldNickname = member.nickname || member.user.username;
	MySQL.query('INSERT INTO member_names VALUES (' + Util.escape(member.uid) + ', ' + name + ') ON CONFLICT ("ID") DO UPDATE SET "NAME" = ' + name);
});

DBot.RegisterCommand({
	name: 'namelog',
	alias: ['usernamelog', 'usernames', 'unames', 'unameslog'],
	
	help_args: '<user>',
	desc: 'Lists all known nicks used by specified user',
	allowUserArgument: true,
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (typeof args[0] != 'object')
			return 'Must be an user ;n;';
		
		MySQL.query('SELECT "NAME", "LASTUSE", "TIME" FROM name_logs WHERE "MEMBER" = ' + sql.UMember(args[0], msg.channel.guild) + ' ORDER BY "LASTUSE" DESC', function(err, data) {
			if (err) {
				msg.reply('WTF');
				console.error(err);
				return;
			}
			
			if (!data || !data[0]) {
				msg.reply('No data was returned');
				return;
			}
			
			let output = '```\n' + Util.AppendSpaces('Nickname', 20) + Util.AppendSpaces('Total time in use', 40) + Util.AppendSpaces('Last use', 30) + '\n';
			
			for (let row of data) {
				let date = moment.unix(row.LASTUSE);
				let total = row.TIME;
				let name = utf8.decode(row.NAME);
				
				output += Util.AppendSpaces(name, 20) + Util.AppendSpaces(hDuration(Math.floor(total) * 1000), 40) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.LASTUSE) * 1000) + ' ago)', 30) + '\n';
			}
			
			output += '\nLast use and Total time updates about every 20 seconds\n```';
			
			msg.reply(output);
		});
	}
});
