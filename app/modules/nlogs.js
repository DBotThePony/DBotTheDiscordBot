
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
	
	for (let user of DBot.GetUsers()) {
		try {
			let name = user.username;
			let uid = DBot.GetUserIDSoft(user);
			if (!uid)
				continue;
			
			user.oldUName = user.oldUName;
			
			if (user.oldUName != name) {
				
				for (let server of DBot.GetUserServers(user)) {
					let member = server.member(user);
					let notifications = cvars.Server(server).getVar('notifications').getBool();
					let name_notify = cvars.Server(server).getVar('name_notify').getBool();
					
					if (notifications && name_notify) {
						let channel = DBot.GetNotificationChannel(server);
						
						if (channel) {
							channel.sendMessage('```\nUser @' + member.oldUName + ' (@' + member.user.username + ') has changes his username to @' + name + '\n```');
						}
					}
				}
				
				finalQuery += 'UPDATE user_names SET "USERNAME" = ' + Util.escape(name) + ' WHERE "ID" = ' + uid + ';';
			}
			
			user.oldUName = name;
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
	MySQL.query('INSERT INTO member_names VALUES (' + Util.escape(member.uid) + ', ' + name + ') ON CONFLICT ("ID") DO UPDATE SET "NAME" = ' + name, function(err) {
		if (!err)
			return;
		
		console.error('Failed to save nickname for user ' + id + ' (' + user.username + ')!');
		console.error(err);
	});
});

hook.Add('UserInitialized', 'MemberNameLogs', function(user, id) {
	let name = Util.escape(user.username);
	user.oldUName = user.username;
	
	MySQL.query('INSERT INTO user_names ("ID", "USERNAME") VALUES (' + id + ', ' + name + ') ON CONFLICT ("ID") DO UPDATE SET "USERNAME" = ' + name, function(err) {
		if (!err)
			return;
		
		console.error('Failed to save username for user ' + id + ' (' + user.username + ')!');
		console.error(err);
	});
});

DBot.RegisterCommand({
	name: 'namelog',
	alias: ['membernamelog', 'membernames', 'mnames', 'menamemeslog', 'namelogs'],
	
	help_args: '[user]',
	desc: 'Lists all known nicks (**server nicknames**) used by specified user\nIf not user specified, lists all nicks changed in the past',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (typeof args[0] == 'object') {
			if (!msg.channel.guild.member(args[0]))
				return DBot.CommandError('Must be valid user', 'namelog', args, 1);
			
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
					let name = row.NAME;
					
					output += Util.AppendSpaces(name, 20) + Util.AppendSpaces(hDuration(Math.floor(total) * 1000), 40) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.LASTUSE) * 1000) + ' ago)', 30) + '\n';
				}
				
				output += '\nLast use and Total time updates about every 20 seconds\n```';
				
				msg.reply(output);
			});
		} else {
			let fuckingQuery = `
				SELECT
					name_logs_list."OLD",
					name_logs_list."NEW",
					name_logs_list."STAMP"
				FROM
					name_logs_list,
					member_id
				WHERE
					name_logs_list."MEMBER" = member_id."ID" AND
					member_id."SERVER" = ${msg.channel.guild.uid}
				ORDER BY name_logs_list."STAMP" DESC
				LIMIT 10`;
			
			Postgres.query(fuckingQuery, function(err, data) {
				if (err) {
					msg.reply('WTF');
					return;
				}
				
				if (!data[0]) {
					msg.reply('No data was returned in query');
					return;
				}
				
				let output = '\n```\n';
				
				for (let row of data) {
					output += row.OLD + '  --->   ' + row.NEW + '   (' + moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ', ' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)\n'
				}
				
				msg.reply(output + '\n```');
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'unamelog',
	alias: ['usernamelog', 'usernames', 'unames', 'unameslog', 'unamelogs'],
	
	help_args: '<user>',
	desc: 'Lists all known usernames (**discord usernames**) used by specified user',
	allowUserArgument: true,
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (typeof args[0] != 'object')
			return 'Must be an user ;n;';
		
		MySQL.query('SELECT "NAME", "LASTUSE", "TIME" FROM uname_logs WHERE "USER" = ' + sql.User(args[0]) + ' ORDER BY "LASTUSE" DESC', function(err, data) {
			if (err) {
				msg.reply('WTF');
				console.error(err);
				return;
			}
			
			if (!data || !data[0]) {
				msg.reply('No data was returned');
				return;
			}
			
			let output = '```\n' + Util.AppendSpaces('Username', 20) + Util.AppendSpaces('Total time in use', 40) + Util.AppendSpaces('Last use', 30) + '\n';
			
			for (let row of data) {
				let date = moment.unix(row.LASTUSE);
				let total = row.TIME;
				let name = row.NAME;
				
				output += Util.AppendSpaces(name, 20) + Util.AppendSpaces(hDuration(Math.floor(total) * 1000), 40) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.LASTUSE) * 1000) + ' ago)', 30) + '\n';
			}
			
			output += '\nLast use and Total time updates about every 20 seconds\n```';
			
			msg.reply(output);
		});
	}
});
