
/* global hook, sql, Postgres, DBot, Util */

const moment = DBot.js.moment;
const hDuration = DBot.js.hDuration;
const fs = DBot.js.fs;
const pug = DBot.js.pug;

Util.mkdir(DBot.WebRoot + '/rlogs');

let updating = {};
let INIT = false;

hook.Add('MemberRoleAdded', 'RoleLogs', function(member, role) {
	if (!INIT) return;
	Postgres.query('INSERT INTO roles_log ("MEMBER", "ROLE", "TYPE", "STAMP") VALUES (' + sql.Member(member) + ', ' + sql.Role(role) + ', true, ' + Postgres.escape(Math.floor(CurTime())) + ')');
	Postgres.query('INSERT INTO member_roles VALUES (' + sql.Member(member) + ', ' + sql.Role(role) + ') ON CONFLICT DO NOTHING');
});

hook.Add('MemberRoleRemoved', 'RoleLogs', function(member, role) {
	if (!INIT) return;
	Postgres.query('INSERT INTO roles_log ("MEMBER", "ROLE", "TYPE", "STAMP") VALUES (' + sql.Member(member) + ', ' + sql.Role(role) + ', true, ' + Postgres.escape(Math.floor(CurTime())) + ')');
	Postgres.query('INSERT INTO member_roles VALUES (' + sql.Member(member) + ', ' + sql.Role(role) + ') ON CONFLICT DO NOTHING');
});

hook.Add('UpdateLoadingLevel', 'RoleLogs', function(callFunc) {
	callFunc(true, 1);
});

hook.Add('RolesInitialized', 'RoleLogs', function(roleCollection) {
	INIT = true;
	
	let q = 'SELECT\
		"member_roles"."ROLE",\
		array_to_string(array_agg("member_roles"."MEMBER"), \',\') AS "MEMBER",\
		array_to_string(array_agg("users"."UID"), \',\') AS "USER"\
	FROM\
		"member_roles",\
		"users",\
		"members"\
	WHERE\
		"member_roles"."ROLE" = ANY (' + roleCollection.getUIDsArray() + '::INTEGER[]) AND\
		"members"."ID" = "member_roles"."MEMBER" AND\
		"users"."ID" = "members"."USER"\
	GROUP BY\
		"member_roles"."ROLE"';
	
	Postgres.query(q, function(err, data) {
		if (err) throw err;
		DBot.updateLoadingLevel(false);
		
		let cTime = Postgres.escape(Math.floor(CurTime()));
		
		let finalQuery = '';
		
		for (let row of data) {
			let role = roleCollection.getByUID(row.ROLE);
			let usersArray = row.USER.split(',');
			let membersIDArray = row.MEMBER.split(',');
			
			let members = role.members.array();
			let sRole = role.uid;
			
			for (let member of members) {
				let hit = false;
				
				for (let userid of usersArray) {
					if (userid === member.id) {
						hit = true;
						break;
					}
				}
				
				if (!hit) {
					finalQuery += 'INSERT INTO roles_log ("MEMBER", "ROLE", "TYPE", "STAMP") VALUES (' + sql.Member(member) + ', ' + sRole + ', true, ' + cTime + ');';
					finalQuery += 'INSERT INTO member_roles VALUES (' + sql.Member(member) + ', ' + sRole + ') ON CONFLICT DO NOTHING;';
				}
			}
			
			for (let userid of usersArray) {
				let hit = false;
				let memberid = 0;
				
				for (let member of members) {
					if (userid === member.id) {
						hit = true;
						break;
					}
					
					memberid++;
				}
				
				if (!hit) {
					let mbr = membersIDArray[memberid];
					if (!mbr)
						return; // WTF?
					
					finalQuery += 'INSERT INTO roles_log ("MEMBER", "ROLE", "TYPE", "STAMP") VALUES (\'' + mbr + '\', ' + sRole + ', false, ' + cTime + ');';
					finalQuery += 'DELETE FROM member_roles WHERE "MEMBER" = \'' + mbr + '\' AND "ROLE" = ' + sRole + ';';
				}
			}
		}
		
		Postgres.query(finalQuery);
	});
});

const Perms = [
	'CREATE_INSTANT_INVITE',
	'KICK_MEMBERS',
	'BAN_MEMBERS',
	'ADMINISTRATOR',
	'MANAGE_CHANNELS',
	'MANAGE_GUILD',
	'ADD_REACTIONS', // add reactions to messages
	'READ_MESSAGES',
	'SEND_MESSAGES',
	'SEND_TTS_MESSAGES',
	'MANAGE_MESSAGES',
	'EMBED_LINKS',
	'ATTACH_FILES',
	'READ_MESSAGE_HISTORY',
	'MENTION_EVERYONE',
	'EXTERNAL_EMOJIS', // use external emojis
	'CONNECT', // connect to voice
	'SPEAK', // speak on voice
	'MUTE_MEMBERS', // globally mute members on voice
	'DEAFEN_MEMBERS', // globally deafen members on voice
	'MOVE_MEMBERS', // move member's voice channels
	'USE_VAD', // use voice activity detection
	'CHANGE_NICKNAME',
	'MANAGE_NICKNAMES', // change nicknames of others
	'MANAGE_ROLES_OR_PERMISSIONS',
	'MANAGE_WEBHOOKS',
	'MANAGE_EMOJIS'
];

const PermsNames = [
	'Create instant invations',
	'Kick users',
	'Ban users',
	'Is Administrator of the server',
	'Can manipulate channels settings',
	'Can manipulate server settings',
	'Can react to messages', // add reactions to messages
	'Can read messages',
	'Can send messages',
	'Can send Text-To-Speech messages',
	'Can manipulate messages',
	'Can embed links to messages',
	'Can attach files',
	'Can read message history',
	'Can mention everyone (@everyone)',
	'Can use external emoji', // use external emojis
	'Can connect to a voice channel', // connect to voice
	'Can speak in voice channel', // speak on voice
	'Can mute members in voice chats', // globally mute members on voice
	'Can deafen members in voice chats', // globally deafen members on voice
	'Can move members in voice chats', // move member's voice channels
	'Can use VoiceActivityDetection', // use voice activity detection
	'Can change nickname',
	'Can manipulate nicknames', // change nicknames of others
	'Can manipulate roles',
	'Can manipulate Web Hooks',
	'Can change custom server emoji'
];

const roleMappedTexts = {};

for (const i in Perms) {
	roleMappedTexts[Perms[i]] = PermsNames[i];
}

let fullDesc = `
Sub commands are:
users
user @user
permissions
hoist
position
mention
color
By default - users is called
`;

DBot.RegisterCommand({
	name: 'rolelog',
	alias: ['rolelogs', 'roleslog', 'roleslogs'],
	
	help_args: '',
	desc: 'Lists some of role changes',
	desc_full: fullDesc,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (args[0])
			args[0] = args[0].toLowerCase();
		
		let mode = args[0] || 'users';
		mode = mode.toLowerCase();
		
		let isFull = args[1] && (args[1].toLowerCase() === 'full' || args[1].toLowerCase() === 'f' || args[1].toLowerCase() === 'all');
		let limitStr = !isFull && '20' || '300';
		let sha = String.hash(CurTime() + '_roles_' + msg.channel.guild.id);
		let path = DBot.WebRoot + '/rlogs/' + sha + '.html';
		let pathU = DBot.URLRoot + '/rlogs/' + sha + '.html';
		
		if (mode === 'full' || mode === 'f' || mode === 'all') {
			mode = 'users';
			limitStr = '300';
			isFull = true;
		}
		
		let userSpace = isFull && 40 || 20;
		let roleSpace = isFull && 20 || 10;
		let permSpace = isFull && 40 || 20;
		
		msg.channel.startTyping();
		
		const handleExc = function(err, data) {
			if (err) {
				msg.channel.stopTyping();
				msg.reply('WTF');
				console.error(err);
				return true;
			}

			if (!data || !data[0]) {
				msg.channel.stopTyping();
				msg.reply('No data was returned in query');
				return true;
			}
			
			return false;
		};
		
		if (mode === 'users') {
			let funckingQuery = 'SELECT\
				roles_log."ID" AS "ENTRY",\
				roles_log."ROLE",\
				roles_log."TYPE",\
				roles_log."STAMP",\
				roles."NAME" AS "ROLENAME",\
				members."NAME" AS "MEMBERNAME"\
			FROM\
				roles_log,\
				roles,\
				members,\
				servers\
			WHERE\
				servers."ID" = get_server_id(\'' + msg.channel.guild.id + '\') AND\
				roles_log."MEMBER" = members."ID" AND\
				members."SERVER" = servers."ID" AND\
				roles."ID" = roles_log."ROLE"\
			GROUP BY\
				"ENTRY",\
				roles."NAME",\
				members."NAME"\
			ORDER BY\
				"ENTRY" DESC\
			LIMIT ' + limitStr;
			
			Postgres.query(funckingQuery, function(err, data) {
				if (handleExc(err, data)) return;
				
				let output = '```\n' + Util.AppendSpaces('User', userSpace) + Util.AppendSpaces('Role', roleSpace) + Util.AppendSpaces('Type', 5) + Util.AppendSpaces('Time', 30) + '\n';
				
				for (let row of data) {
					let date = moment.unix(row.STAMP);
					let status = row.TYPE;
					let name = row.MEMBERNAME;
					let rname = row.ROLENAME;
					
					output += Util.AppendSpaces(name, userSpace) + Util.AppendSpaces(rname, roleSpace) + Util.AppendSpaces(status && 'A' || 'D', 5) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)', 30) + '\n';
				}
				
				output += '\n```';
				
				if (!isFull) {
					msg.reply(output);
					msg.channel.stopTyping();
				} else {
					let stream = fs.createWriteStream(path);
					stream.write(output);
					stream.end();
					msg.reply(pathU);
					msg.channel.stopTyping();
				}
			});
		} else if (mode === 'user') {
			if (typeof args[1] !== 'object') {
				msg.channel.stopTyping();
				return DBot.CommandError('Must be user', 'rolelog', args, 2);
			}
			
			let getUser = msg.channel.guild.member(args[1]);
			
			if (!getUser) {
				msg.channel.stopTyping();
				return DBot.CommandError('Must be member of this server', 'rolelog', args, 2);
			}
			
			let funckingQuery = 'SELECT\
				roles_log."ID" AS "ENTRY",\
				roles_log."ROLE",\
				roles_log."TYPE",\
				roles_log."STAMP",\
				roles."NAME" AS "ROLENAME"\
			FROM\
				roles_log,\
				roles,\
				members,\
				servers\
			WHERE\
				members."ID" = ' + getUser.uid + ' AND\
				servers."ID" = ' + msg.channel.guild.uid + ' AND\
				roles_log."MEMBER" = members."ID" AND\
				members."SERVER" = servers."ID" AND\
				roles."ID" = roles_log."ROLE"\
			GROUP BY\
				"ENTRY",\
				roles."NAME"\
			ORDER BY\
				"ENTRY" DESC\
			LIMIT ' + limitStr;
			
			Postgres.query(funckingQuery, function(err, data) {
				if (handleExc(err, data)) return;
				
				let output = '```\n' + Util.AppendSpaces('Role', roleSpace) + Util.AppendSpaces('Type', 5) + Util.AppendSpaces('Time', 30) + '\n';
				
				for (let row of data) {
					let date = moment.unix(row.STAMP);
					let status = row.TYPE;
					let name = row.MEMBERNAME;
					let rname = row.ROLENAME;
					
					output += Util.AppendSpaces(rname, roleSpace) + Util.AppendSpaces(status && 'A' || 'D', 5) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)', 30) + '\n';
				}
				
				output += '\n```';
				
				if (!isFull) {
					msg.channel.stopTyping();
					msg.reply(output);
				} else {
					let stream = fs.createWriteStream(path);
					stream.write(output);
					stream.end();
					msg.reply(pathU);
					msg.channel.stopTyping();
				}
			});
		} else if (mode === 'permissions' || mode === 'perms') {
			let funckingQuery = 'SELECT\
				roles_changes_perms."ID" AS "ENTRY",\
				roles_changes_perms."ROLEID",\
				roles_changes_perms."PERM",\
				roles_changes_perms."TYPE",\
				roles_changes_perms."STAMP",\
				roles."NAME" AS "ROLENAME"\
			FROM\
				roles_changes_perms,\
				roles,\
				servers\
			WHERE\
				servers."ID" = get_server_id(\'' + msg.channel.guild.id + '\') AND\
				roles."SERVER" = servers."ID" AND\
				roles."ID" = roles_changes_perms."ROLEID"\
			GROUP BY\
				"ENTRY",\
				roles."NAME"\
			ORDER BY\
				"ENTRY" DESC\
			LIMIT ' + limitStr;
			
			Postgres.query(funckingQuery, function(err, data) {
				if (handleExc(err, data)) return;
				
				let data2 = [];
				
				for (let row of data) {
					data2.push({
						name: row.ROLENAME,
						perm_help: roleMappedTexts[row.PERM],
						perm: row.PERM,
						status: row.TYPE,
						date: Util.formatStamp(row.STAMP)
					});
				}
				
				fs.writeFile(path, DBot.pugRender('roles_perms.pug', {
					data: data2,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					title: 'Roles Permission log'
				}), console.errHandler);
				msg.reply(pathU);
				msg.channel.stopTyping();
			});
		} else if (mode === 'hoist') {
			let funckingQuery = 'SELECT\
				roles_changes_hoist."ID" AS "ENTRY",\
				roles_changes_hoist."ROLEID",\
				roles_changes_hoist."OLD",\
				roles_changes_hoist."NEW",\
				roles_changes_hoist."STAMP",\
				roles."NAME" AS "ROLENAME"\
			FROM\
				roles_changes_hoist,\
				roles,\
				servers\
			WHERE\
				servers."ID" = get_server_id(\'' + msg.channel.guild.id + '\') AND\
				roles."SERVER" = servers."ID" AND\
				roles."ID" = roles_changes_hoist."ROLEID"\
			GROUP BY\
				"ENTRY",\
				roles."NAME"\
			ORDER BY\
				"ENTRY" DESC\
			LIMIT ' + limitStr;
			
			Postgres.query(funckingQuery, function(err, data) {
				if (handleExc(err, data)) return;
				
				let data2 = [];
				
				for (let row of data) {
					data2.push({
						name: row.ROLENAME,
						old: row.OLD,
						new: row.NEW,
						date: Util.formatStamp(row.STAMP)
					});
				}
				
				fs.writeFile(path, DBot.pugRender('roles_bool.pug', {
					data: data2,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					title: 'Roles "Hoist" log'
				}), console.errHandler);
				msg.reply(pathU);
				msg.channel.stopTyping();
			});
		} else if (mode === 'position') {
			let funckingQuery = 'SELECT\
				roles_changes_position."ID" AS "ENTRY",\
				roles_changes_position."ROLEID",\
				roles_changes_position."OLD",\
				roles_changes_position."NEW",\
				roles_changes_position."STAMP",\
				roles."NAME" AS "ROLENAME"\
			FROM\
				roles_changes_position,\
				roles,\
				servers\
			WHERE\
				servers."ID" = get_server_id(\'' + msg.channel.guild.id + '\') AND\
				roles."SERVER" = servers."ID" AND\
				roles."ID" = roles_changes_position."ROLEID"\
			GROUP BY\
				"ENTRY",\
				roles."NAME"\
			ORDER BY\
				"ENTRY" DESC\
			LIMIT ' + limitStr;
			
			Postgres.query(funckingQuery, function(err, data) {
				if (handleExc(err, data)) return;
				
				let data2 = [];
				
				for (let row of data) {
					data2.push({
						name: row.ROLENAME,
						old: row.OLD,
						new: row.NEW,
						date: Util.formatStamp(row.STAMP)
					});
				}
				
				fs.writeFile(path, DBot.pugRender('roles_position.pug', {
					data: data2,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					title: 'Roles position log'
				}), console.errHandler);
				msg.reply(pathU);
				msg.channel.stopTyping();
			});
		} else if (mode === 'mention') {
			let funckingQuery = 'SELECT\
				roles_changes_mention."ID" AS "ENTRY",\
				roles_changes_mention."ROLEID",\
				roles_changes_mention."OLD",\
				roles_changes_mention."NEW",\
				roles_changes_mention."STAMP",\
				roles."NAME" AS "ROLENAME"\
			FROM\
				roles_changes_mention,\
				roles,\
				servers\
			WHERE\
				servers."ID" = get_server_id(\'' + msg.channel.guild.id + '\') AND\
				roles."SERVER" = servers."ID" AND\
				roles."ID" = roles_changes_mention."ROLEID"\
			GROUP BY\
				"ENTRY",\
				roles."NAME"\
			ORDER BY\
				"ENTRY" DESC\
			LIMIT ' + limitStr;
			
			Postgres.query(funckingQuery, function(err, data) {
				if (handleExc(err, data)) return;
				
				let data2 = [];
				
				for (let row of data) {
					data2.push({
						name: row.ROLENAME,
						old: row.OLD,
						new: row.NEW,
						date: Util.formatStamp(row.STAMP)
					});
				}
				
				fs.writeFile(path, DBot.pugRender('roles_bool.pug', {
					data: data2,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					title: 'Roles "Mentionable" log'
				}), console.errHandler);
				msg.reply(pathU);
				msg.channel.stopTyping();
			});
		} else if (mode === 'color') {
			let funckingQuery = 'SELECT\
				roles_changes_color."ID" AS "ENTRY",\
				roles_changes_color."ROLEID",\
				roles_changes_color."OLD",\
				roles_changes_color."NEW",\
				roles_changes_color."STAMP",\
				roles."NAME" AS "ROLENAME"\
			FROM\
				roles_changes_color,\
				roles,\
				servers\
			WHERE\
				servers."ID" = get_server_id(\'' + msg.channel.guild.id + '\') AND\
				roles."SERVER" = servers."ID" AND\
				roles."ID" = roles_changes_color."ROLEID"\
			GROUP BY\
				"ENTRY",\
				roles."NAME"\
			ORDER BY\
				"ENTRY" DESC\
			LIMIT ' + limitStr;
			
			Postgres.query(funckingQuery, function(err, data) {
				if (handleExc(err, data)) return;
				
				let data2 = [];
				
				for (let row of data) {
					data2.push({
						name: row.ROLENAME,
						old: row.OLD,
						new: row.NEW,
						date: Util.formatStamp(row.STAMP)
					});
				}
				
				fs.writeFile(path, DBot.pugRender('roles_color.pug', {
					data: data2,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					title: 'Roles color log'
				}), console.errHandler);
				msg.reply(pathU);
				msg.channel.stopTyping();
			});
		} else {
			return DBot.CommandError('Unknown subcommand', 'rolelogs', args, 1);
		}
	}
});

DBot.RegisterCommand({
	name: 'frolelog',
	alias: ['frolelogs', 'froleslog', 'froleslogs'],
	
	help_args: '',
	desc: '',
	help_hide: true,
	
	func: function() {
		return 'Just a hint: Use `}rolelog <action> full` instead';
	}
});
