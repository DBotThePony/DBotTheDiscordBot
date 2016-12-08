
const moment = require('moment');
const utf8 = require('utf8');
const hDuration = require('humanize-duration');

cvars.ServerVar('name_notify', '0', [FCVAR_BOOLONLY], 'Enable nickname changes notifications');

hook.Add('UpdateMemberVars', 'NameLogs', function(member) {
	try {
		let uid = member.user.id;
		let sid = member.guild.id;
		let name = member.nickname || member.user.username;
		
		member.oldNickname = member.oldNickname || name;
		
		let notifications = cvars.Server(member.guild).getVar('notifications').getBool();
		let name_notify = cvars.Server(member.guild).getVar('name_notify').getBool();
		
		if (member.oldNickname != name && notifications && name_notify) {
			let channel = DBot.GetNotificationChannel(member.guild);
			
			if (channel) {
				channel.sendMessage('```\nUser @' + member.oldNickname + ' (@' + member.user.username + ') has changes his nick to @' + name + '\n```');
			}
		}
		
		member.oldNickname = name;
		
		let time = CurTime();
		member.NTime = member.NTime || time;
		let delta = time - member.NTime;
		
		member.NTime = time;
		
		MySQL.query('INSERT INTO name_logs ("MEMBER", "NAME", "LASTUSE", "TIME") VALUES (' + sql.Member(member) + ', ' + Util.escape(name) + ', ' + Math.floor(time) + ', ' + delta + ') ON CONFLICT ("MEMBER", "NAME") DO UPDATE SET "LASTUSE" = ' + Util.escape(Math.floor(time)) + ', "TIME" = "TIME" + ' + Util.escape(delta));
	} catch(err) {
		console.error(err);
	}
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
		
		MySQL.query('SELECT "NAME", "LASTUSE", "TIME" FROM name_logs WHERE "ID" = ' + DBot.GetUserID(args[0]) + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild) + ' ORDER BY "LASTUSE" DESC', function(err, data) {
			if (err || !data || !data[0]) {
				msg.reply('WTF');
				return;
			}
			
			let output = '```\n' + Util.AppendSpaces('Nickname', 20) + Util.AppendSpaces('Total time in use', 30) + Util.AppendSpaces('Last use', 30) + '\n';
			
			for (let row of data) {
				let date = moment.unix(row.LASTUSE);
				let total = row.TIME;
				let name = utf8.decode(row.NAME);
				
				output += Util.AppendSpaces(name, 20) + Util.AppendSpaces(hDuration(total * 1000), 30) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.LASTUSE) * 1000) + ' ago)', 30) + '\n';
			}
			
			output += '\nLast use and Total time updates about every 20 seconds\n```';
			
			msg.reply(output);
		});
	}
});
