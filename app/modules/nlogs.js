
/* global cvars, hook, DBot, Postgres, FCVAR_BOOLONLY, Util, sql */

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

hook.Add('UserNicknameChanges', 'MemberNameLogs', function(user, oldUser) {
	if (!DBot.SQLReady()) return;
	
	try {
		let name = user.username;
		let uid = DBot.GetUserIDSoft(user);
		if (!uid) return;
		if (!name) return;

		let oldName = oldUser.username;

		for (let server of DBot.GetUserServers(user)) {
			let notifications = cvars.Server(server).getVar('notifications').getBool();
			let name_notify = cvars.Server(server).getVar('name_notify').getBool();

			if (notifications && name_notify) {
				let channel = DBot.GetNotificationChannel(server);

				if (channel) {
					channel.sendMessage('```\nUser @' + oldName + ' has changes his username to @' + name + ' (<@' + user.id + '>)\n```');
				}
			}
		}

		Postgres.query('UPDATE users SET "NAME" = ' + Postgres.escape(name) + ' WHERE "ID" = ' + uid + ';');
	} catch(err) {
		console.error(err);
	}
});

if (!DBot.NLOGS_INIT) {
	DBot.NLOGS_INIT = true;
	
	setInterval(function() {
		if (!DBot.SQLReady()) return;

		Postgres.query('SELECT update_nicknames_stats(' + Math.floor(CurTime()) + ');', function(err) {
			if (err) {
				console.error(err);
				console.error('OOPS, unable to update nicknames!');
			}
		});
	}, 10000);
}

hook.Add('UpdateLoadingLevel', 'NameLogs', function(callFunc) {
	callFunc(true, 2);
});

hook.Add('MemberInitialized', 'MemberNameLogs', function(member, uid, isCascade) {
	if (!DBot.SQLReady() || isCascade) return;
	
	let name = Postgres.escape(member.nickname || member.user.username);
	Postgres.query('UPDATE members SET "NAME" = ' + name + ' WHERE "ID" = ' + member.uid, console.errHandler);
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
	
	Postgres.query(`WITH name_data AS (SELECT * FROM (VALUES ${finalQuery}) AS tm ("ID", "NAME")),
		insert_uname_logs AS (INSERT INTO uname_logs ("USER", "NAME", "LASTUSE", "TIME") (SELECT name_data."ID", name_data."NAME", currtime(), 0 FROM name_data) ON CONFLICT ("USER", "NAME") DO NOTHING)
		UPDATE users SET "NAME" = name_data."NAME" FROM name_data WHERE users."ID" = name_data."ID";`, err => {
			if (err) throw err;
			DBot.updateLoadingLevel(false);
	});
});

Util.mkdir(DBot.WebRoot + '/namelog');

const fn = function(name, lim) {
	return function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		const sha = String.hash(CurTime() + '_nlogs_' + msg.channel.guild.id + '___' + msg.author.id);
		const path = DBot.WebRoot + '/namelog/' + sha + '.html';
		const pathU = DBot.URLRoot + '/namelog/' + sha + '.html';
		
		if (typeof args[0] === 'object') {
			let member = msg.channel.guild.member(args[0]);
			if (!member)
				return DBot.CommandError('Must be a valid user', name, args, 1);
			
			msg.channel.startTyping();
			
			Postgres.query('SELECT "NAME", "LASTUSE", "TIME", "FIRSTUSED" FROM name_logs WHERE "MEMBER" = ' + sql.Member(member) + ' ORDER BY "LASTUSE" DESC LIMIT ' + lim, function(err, data) {
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
				
				let data2 = [];
				
				for (const row of data) {
					data2.push({
						last_used: Util.formatStamp(row.LASTUSE),
						username: row.NAME,
						first_used: Util.formatStamp(row.FIRSTUSED),
						total_used: hDuration(Math.floor(row.TIME) * 1000)
					});
				}

				fs.writeFile(path, DBot.pugRender('nlogs_user.pug', {
					data: data2,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					name: member.user.username,
					nick: member.nickname || member.user.username,
					title: 'Nickname changes of ' + (member.nickname || member.user.username)
				}), console.errHandler);
				
				msg.channel.stopTyping();
				msg.reply(pathU);
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
				LIMIT ${lim}`;
			
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
				
				let data2 = [];
				
				for (const row of data) {
					data2.push({
						date: Util.formatStamp(row.STAMP),
						uold: row.OLD,
						unew: row.NEW
					});
				}

				fs.writeFile(path, DBot.pugRender('nlogs_generic.pug', {
					data: data2,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					title: 'Nickname changes logs'
				}), console.errHandler);
				
				msg.channel.stopTyping();
				msg.reply(pathU);
			});
		}
	};
};

DBot.RegisterCommand({
	name: 'namelog',
	alias: ['membernamelog', 'membernames', 'mnames', 'menamemeslog', 'namelogs'],
	
	help_args: '[user]',
	desc: 'Lists all known nicks (**server nicknames**) used by specified user (up to 40)\nIf not user specified, lists nicks changed in the past (up to 40)',
	allowUserArgument: true,
	
	func: fn('namelog', 40)
});

DBot.RegisterCommand({
	name: 'fnamelog',
	alias: ['fullnamelog', 'fnamelogs'],
	
	help_args: '[user]',
	desc: 'Lists last (up to 200) nickname changes',
	allowUserArgument: true,
	
	func: fn('fnamelog', 400)
});

DBot.RegisterCommand({
	name: 'unamelog',
	alias: ['usernamelog', 'usernames', 'unames', 'unameslog', 'unamelogs'],
	
	help_args: '<user>',
	desc: 'Lists all known usernames (**discord usernames**) used by specified user',
	allowUserArgument: true,
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (typeof args[0] !== 'object')
			return 'Must be an user ;n;';
		
		msg.channel.startTyping();
		
		const sha = String.hash(CurTime() + '_nlogs_' + msg.author.id + '___' + args[0].id);
		const path = DBot.WebRoot + '/namelog/' + sha + '.html';
		const pathU = DBot.URLRoot + '/namelog/' + sha + '.html';
		
		Postgres.query('SELECT "NAME", "LASTUSE", "TIME", "FIRSTUSED" FROM uname_logs WHERE "USER" = ' + sql.User(args[0]) + ' ORDER BY "LASTUSE" DESC', function(err, data) {
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
			
			let data2 = [];

			for (const row of data) {
				data2.push({
					last_used: Util.formatStamp(row.LASTUSE),
					username: row.NAME,
					first_used: Util.formatStamp(row.FIRSTUSED),
					total_used: hDuration(Math.floor(row.TIME) * 1000)
				});
			}

			fs.writeFile(path, DBot.pugRender('nlogs_user_u.pug', {
				data: data2,
				date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
				username: msg.author.username,
				server: msg.channel.guild && msg.channel.guild.name || 'DM Channel',
				name: args[0].username,
				title: 'Username changes of ' + (args[0].username)
			}), console.errHandler);

			msg.channel.stopTyping();
			msg.reply(pathU);
		});
	}
});
