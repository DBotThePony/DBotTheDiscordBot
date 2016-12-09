
const moment = require('moment');
const utf8 = require('utf8');
const hDuration = require('humanize-duration');

let updating = {};

let updateRoleRules = function(role) {
	if (role.name == '@everyone')
		return;
	
	let members = role.members.array();
	let sRole = sql.Role(role);
	
	MySQL.query('SELECT "MEMBER", restore_member(member_roles."MEMBER") as "USER" FROM member_roles WHERE "ROLE" = ' + sRole, function(err, data) {
		if (err) throw err;
		data = data || {};
		
		for (let member of members) {
			let hit = false;
			
			for (let row of data) {
				if (row.USER == member.id) {
					hit = true;
					break;
				}
			}
			
			if (!hit) {
				MySQL.query('INSERT INTO roles_log ("MEMBER", "ROLE", "TYPE", "STAMP") VALUES (' + sql.Member(member) + ', ' + sRole + ', true, ' + Util.escape(Math.floor(CurTime())) + ')');
				MySQL.query('INSERT INTO member_roles VALUES (' + sql.Member(member) + ', ' + sRole + ') ON CONFLICT DO NOTHING');
			}
		}
		
		for (let row of data) {
			let hit = false;
			
			for (let member of members) {
				if (row.USER == member.id) {
					hit = true;
					break;
				}
			}
			
			if (!hit) {
				MySQL.query('INSERT INTO roles_log ("MEMBER", "ROLE", "TYPE", "STAMP") VALUES (\'' + row.MEMBER + '\', ' + sRole + ', false, ' + Util.escape(Math.floor(CurTime())) + ')');
				MySQL.query('DELETE FROM member_roles WHERE "MEMBER" = \'' + row.MEMBER + '\' AND "ROLE" = ' + sRole);
			}
		}
	});
}

hook.Add('RoleInitialized', 'Default', updateRoleRules);

hook.Add('MemberChanges', 'Default', function(oldM, newM) {
	for (let role of oldM.roles.array()) {
		updateRoleRules(role);
	}
	
	for (let role of newM.roles.array()) {
		updateRoleRules(role);
	}
});

/*
SELECT
	roles_log."ID" AS "ENTRY",
	roles_log."MEMBER",
	roles_log."ROLE",
	roles_log."TYPE",
	roles_log."STAMP",
	roles_names."NAME" AS "ROLENAME",
	member_id."USER" AS "USERID",
	member_names."NAME" AS "MEMBERNAME"
FROM
	roles_log,
	roles_names,
	member_id,
	server_id,
	member_names
WHERE
	server_id."ID" = 6 AND
	roles_log."MEMBER" = member_id."ID" AND
	member_id."SERVER" = server_id."ID" AND
	roles_names."ROLEID" = roles_log."ROLE" AND
	member_names."ID" = member_id."ID"
GROUP BY
	"ENTRY"
ORDER BY
	"ENTRY" DESC
*/

DBot.RegisterCommand({
	name: 'rolelog',
	alias: ['rolelogs', 'roleslog', 'roleslogs'],
	
	help_args: '',
	desc: 'Lists some of logs',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		let funckingQuery = 'SELECT\
			roles_log."ID" AS "ENTRY",\
			roles_log."ROLE",\
			roles_log."TYPE",\
			roles_log."STAMP",\
			roles_names."NAME" AS "ROLENAME",\
			member_names."NAME" AS "MEMBERNAME"\
		FROM\
			roles_log,\
			roles_names,\
			member_id,\
			server_id,\
			member_names\
		WHERE\
			server_id."ID" = get_server_id(\'' + msg.channel.guild.id + '\') AND\
			roles_log."MEMBER" = member_id."ID" AND\
			member_id."SERVER" = server_id."ID" AND\
			roles_names."ROLEID" = roles_log."ROLE" AND\
			member_names."ID" = member_id."ID"\
		GROUP BY\
			"ENTRY",\
			roles_names."NAME",\
			member_names."NAME"\
		ORDER BY\
			"ENTRY" DESC\
		LIMIT 10';
		
		MySQL.query(funckingQuery, function(err, data) {
			if (err) {
				msg.reply('WTF');
				console.error(err);
				return;
			}
			
			if (!data || !data[0]) {
				msg.reply('No data is returned in query');
				return;
			}
			
			let output = '```\n' + Util.AppendSpaces('User', 20) + Util.AppendSpaces('Role', 10) + Util.AppendSpaces('Type', 5) + Util.AppendSpaces('Time', 30) + '\n';
			
			for (let row of data) {
				let date = moment.unix(row.STAMP);
				let status = row.TYPE;
				let name = utf8.decode(row.MEMBERNAME);
				let rname = utf8.decode(row.ROLENAME);
				
				output += Util.AppendSpaces(name, 20) + Util.AppendSpaces(rname, 10) + Util.AppendSpaces(status && 'A' || 'D', 5) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)', 30) + '\n';
			}
			
			output += '\n```';
			
			msg.reply(output);
		});
	}
});

