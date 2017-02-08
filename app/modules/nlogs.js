
const moment = require('moment');
const utf8 = require('utf8');
const fs = require('fs');
const hDuration = require('humanize-duration');

cvars.ServerVar('name_notify', '0', [FCVAR_BOOLONLY], 'Enable nickname changes notifications');

hook.Add('MemberNicknameChanges', 'MemberNameLogs', function(member, oldMember) {
	if (!DBot.SQLReady()) return;
	
	try {
		if (!member.guild.uid) return;
		let UiD = DBot.GetMemberIDSoft(member);
		if (!UiD) return;
		
		const oldName = oldMember.nickname || oldMember.user.username;
		const newName = member.nickname || member.user.username;

		let notifications = cvars.Server(member.guild).getVar('notifications').getBool();
		let name_notify = cvars.Server(member.guild).getVar('name_notify').getBool();

		if (notifications && name_notify) {
			let channel = DBot.GetNotificationChannel(member.guild);

			if (channel) {
				channel.sendMessage('```\nUser @' + oldName + ' (@' + member.user.username + ') has changes his nick to @' + newName + '\n```');
			}
		}

		Postgres.query('UPDATE members SET "NAME" = ' + Postgres.escape(newName) + ' WHERE "ID" = ' + UiD + ';');
	} catch(err) {
		console.error(err);
	}
});

setInterval(function() {
	if (!DBot.SQLReady()) return;
	
	let finalQuery = '';
	
	for (let user of DBot.GetUsers()) {
		try {
			let name = user.username;
			let uid = DBot.GetUserIDSoft(user);
			if (!uid) continue;
			if (!name) continue;
			
			user.oldUName = user.oldUName || name;
			
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
				
				finalQuery += 'UPDATE users SET "NAME" = ' + Postgres.escape(name) + ' WHERE "ID" = ' + uid + ';';
			}
			
			user.oldUName = name;
		} catch(err) {
			console.error(err);
		}
	}
	
	finalQuery += 'SELECT update_nicknames_stats(' + Math.floor(CurTime()) + ');';
	
	Postgres.query(finalQuery, function(err) {
		if (err) {
			console.error(err);
			console.error('OOPS, unable to update nicknames!');
		}
	});
}, 10000);

hook.Add('UpdateLoadingLevel', 'NameLogs', function(callFunc) {
	callFunc(true, 2);
});

hook.Add('MemberInitialized', 'MemberNameLogs', function(member, uid, isCascade) {
	if (!DBot.SQLReady() || isCascade) return;
	
	let name = Postgres.escape(member.nickname || member.user.username);
	Postgres.query('UPDATE members SET "NAME" = ' + name + ' WHERE "ID" = ' + member.uid, function(err) {
		if (!err)
			return;
		
		console.error('Failed to save nickname for user ' + id + ' (' + user.username + ')!');
		console.error(err);
	});
});

hook.Add('MembersFetched', 'MemberNameLogs', function(members, server, oldHashMap, collection) {
	if (collection.length === 0) return;
	let finalQuery;
	
	for (let member of collection.objects) {
		if (!member.uid) continue;
		let name = Postgres.escape(member.nickname || member.user.username);
		
		if (finalQuery)
			finalQuery += ',';
		else
			finalQuery = '';
		
		finalQuery += '(' + Postgres.escape(member.uid) + ',' + name + ')';
	}
	
	if (!finalQuery) {
		return;
	}
	
	Postgres.query('UPDATE members SET "NAME" = m."NAME" FROM (VALUES ' + finalQuery + ') AS m ("ID", "NAME") WHERE members."ID" = m."ID"');
});

hook.Add('MembersInitialized', 'MemberNameLogs', function(members) {
	let finalQuery;
	
	for (let member of members) {
		let name = Postgres.escape(member.nickname || member.user.username);
		
		if (finalQuery)
			finalQuery += ',';
		else
			finalQuery = '';
		
		finalQuery += '(' + Postgres.escape(member.uid) + ',' + name + ')';
	}
	
	if (!finalQuery) {
		DBot.updateLoadingLevel(false);
		return;
	}
	
	Postgres.query('UPDATE members SET "NAME" = m."NAME" FROM (VALUES ' + finalQuery + ') AS m ("ID", "NAME") WHERE members."ID" = m."ID"', function() {DBot.updateLoadingLevel(false);});
});

hook.Add('UserInitialized', 'MemberNameLogs', function(user, id) {
	if (!DBot.SQLReady())
		return;
	
	let name = Postgres.escape(user.username);
	user.oldUName = user.username;
	
	Postgres.query('UPDATE users SET "NAME" = ' + name + ' WHERE "ID" = ' + id, function(err) {
		if (!err)
			return;
		
		console.error('Failed to save username for user ' + id + ' (' + user.username + ')!');
		console.error(err);
	});
});

hook.Add('UsersInitialized', 'MemberNameLogs', function() {
	let finalQuery;
	
	for (let user of DBot.GetUsers()) {
		let uid = DBot.GetUserIDSoft(user);
		if (!uid) continue;
		
		let name = Postgres.escape(user.username);
		user.oldUName = user.username;
		
		if (finalQuery)
			finalQuery += ',';
		else
			finalQuery = '';
		
		finalQuery += '(' + uid + ', ' + name + ')';
	}
	
	if (!finalQuery) {
		DBot.updateLoadingLevel(false);
		return;
	}
	
	Postgres.query('UPDATE users SET "NAME" = "VALUES"."NAME" FROM (VALUES ' + finalQuery + ') AS "VALUES" ("ID", "NAME") WHERE users."ID" = "VALUES"."ID";',  function() {DBot.updateLoadingLevel(false);});
});

Util.mkdir(DBot.WebRoot + '/namelog');

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
			let member = msg.channel.guild.member(args[0]);
			if (!member)
				return DBot.CommandError('Must be valid user', 'namelog', args, 1);
			
			msg.channel.startTyping();
			
			Postgres.query('SELECT "NAME", "LASTUSE", "TIME" FROM name_logs WHERE "MEMBER" = ' + sql.Member(member) + ' ORDER BY "LASTUSE" DESC LIMIT 10', function(err, data) {
				if (err) {
					msg.channel.stopTyping();
					msg.reply('WTF');
					console.error(err);
					return;
				}
				
				if (!data || !data[0]) {
					msg.channel.stopTyping();
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
				
				msg.channel.stopTyping();
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
					members
				WHERE
					members."SERVER" = ${msg.channel.guild.uid} AND
					name_logs_list."MEMBER" = members."ID"
				ORDER BY name_logs_list."STAMP" DESC
				LIMIT 10`;
			
			msg.channel.startTyping();
			
			Postgres.query(fuckingQuery, function(err, data) {
				if (err) {
					msg.channel.stopTyping();
					msg.reply('WTF');
					return;
				}
				
				if (!data[0]) {
					msg.channel.stopTyping();
					msg.reply('No data was returned in query');
					return;
				}
				
				let output = '\n```\n';
				
				for (let row of data) {
					output += row.OLD + '  --->   ' + row.NEW + '   (' + moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ', ' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)\n'
				}
				
				msg.channel.stopTyping();
				msg.reply(output + '\n```');
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'fnamelog',
	alias: ['fullnamelog', 'fnamelogs'],
	
	help_args: '[user]',
	desc: 'Lists last (up to 200) nickname changes',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (typeof args[0] == 'object') {
			let member = msg.channel.guild.member(args[0]);
			if (!member)
				return DBot.CommandError('Must be valid user', 'namelog', args, 1);
			
			msg.channel.startTyping();
			
			Postgres.query('SELECT "NAME", "LASTUSE", "TIME" FROM name_logs WHERE "MEMBER" = ' + sql.Member(member) + ' ORDER BY "LASTUSE"', function(err, data) {
				if (err) {
					msg.channel.stopTyping();
					msg.reply('WTF');
					console.error(err);
					return;
				}
				
				if (!data || !data[0]) {
					msg.channel.stopTyping();
					msg.reply('No data was returned');
					return;
				}
				
				let pth = '/namelog/' + String.hash(CurTime()) + '.txt';
				let stream = fs.createWriteStream(DBot.WebRoot + pth);
				
				stream.write('\n' + Util.AppendSpaces('Nickname', 40) + Util.AppendSpaces('Total time in use', 40) + Util.AppendSpaces('Last use', 30) + '\n')
				
				for (let row of data) {
					let date = moment.unix(row.LASTUSE);
					let total = row.TIME;
					let name = row.NAME;
					
					stream.write(Util.AppendSpaces(name, 40) + Util.AppendSpaces(hDuration(Math.floor(total) * 1000), 40) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.LASTUSE) * 1000) + ' ago)', 30) + '\n');
				}
				
				stream.write('\nLast use and Total time updates about every 20 seconds\n');
				stream.end();
				
				stream.on('finish', function() {
					msg.reply(DBot.URLRoot + pth);
					msg.channel.stopTyping();
				});
			});
		} else {
			let fuckingQuery = `
				SELECT
					name_logs_list."OLD",
					name_logs_list."NEW",
					name_logs_list."STAMP"
				FROM
					name_logs_list,
					members
				WHERE
					members."SERVER" = ${msg.channel.guild.uid} AND
					name_logs_list."MEMBER" = members."ID"
				ORDER BY name_logs_list."STAMP" DESC
				LIMIT 200`;
			
			msg.channel.startTyping();
			
			Postgres.query(fuckingQuery, function(err, data) {
				if (err) {
					msg.channel.stopTyping();
					msg.reply('WTF');
					return;
				}
				
				if (!data[0]) {
					msg.channel.stopTyping();
					msg.reply('No data was returned in query');
					return;
				}
				
				let pth = '/namelog/' + String.hash(CurTime() + '_' + msg.channel.guild.id) + '.txt';
				let stream = fs.createWriteStream(DBot.WebRoot + pth);
				stream.write('\n\n');
				
				for (let row of data) {
					stream.write(Util.AppendSpaces(row.OLD, 50) + '  --->   ' + Util.AppendSpaces(row.NEW, 50) + ' (' + moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ', ' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)\n');
				}
				
				stream.end();
				
				stream.on('finish', function() {
					msg.channel.stopTyping();
					msg.reply(DBot.URLRoot + pth);
				});
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
		
		msg.channel.startTyping();
		
		Postgres.query('SELECT "NAME", "LASTUSE", "TIME" FROM uname_logs WHERE "USER" = ' + sql.User(args[0]) + ' ORDER BY "LASTUSE" DESC', function(err, data) {
			if (err) {
				msg.channel.stopTyping();
				msg.reply('WTF');
				console.error(err);
				return;
			}
			
			if (!data || !data[0]) {
				msg.channel.stopTyping();
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
			
			msg.channel.stopTyping();
			msg.reply(output);
		});
	}
});
