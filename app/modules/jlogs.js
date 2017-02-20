
/* global DBot, Util, hook, sql, Postgres, CurTime */

const moment = require('moment');
const fs = DBot.js.filesystem;
const hDuration = require('humanize-duration');

Util.mkdir(DBot.WebRoot + '/jlogs');

hook.Add('ValidClientJoinsServer', 'JLogs', function(user, server, member) {
	Postgres.query('INSERT INTO joinleft_log ("USER", "SERVER", "STAMP", "STATUS") VALUES (' + sql.User(user) + ', ' + sql.Server(server) + ', ' + CurTime() + ', true)');
});

hook.Add('ValidClientLeftServer', 'JLogs', function(user, server, member) {
	Postgres.query('INSERT INTO joinleft_log ("USER", "SERVER", "STAMP", "STATUS") VALUES (' + sql.User(user) + ', ' + sql.Server(server) + ', ' + CurTime() + ', false)');
});

const fn = function(name, lim) {
	return function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		msg.channel.startTyping();
		
		const sha = String.hash(CurTime() + '_joinlogs_' + msg.channel.guild.id + '___' + msg.author.id);
		const path = DBot.WebRoot + '/jlogs/' + sha + '.html';
		const pathU = DBot.URLRoot + '/jlogs/' + sha + '.html';
		
		Postgres.query('SELECT joinleft_log."STAMP", joinleft_log."STATUS", users."NAME" as "USERNAME" FROM joinleft_log, users WHERE joinleft_log."SERVER" = ' + DBot.GetServerID(msg.channel.guild) + ' AND users."ID" = joinleft_log."USER" ORDER BY joinleft_log."ID" DESC LIMIT ' + lim, function(err, data) {
			if (err) {
				msg.reply('WTF');
				msg.channel.stopTyping();
				return;
			}
			
			if (!data || !data[0]) {
				msg.reply('No data is returned in query');
				msg.channel.stopTyping();
				return;
			}
			
			let data2 = [];
			
			for (const row of data) {
				data2.push({
					date: Util.formatStamp(row.STAMP),
					status: row.STATUS,
					username: row.USERNAME
				});
			}
			
			fs.writeFile(path, DBot.pugRender('jlogs.pug', {
				data: data2,
				date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
				username: msg.author.username,
				server: msg.channel.guild.name,
				title: 'Join/leave logs'
			}), console.errHandler);
			
			msg.channel.stopTyping();
			msg.reply(pathU);
		});
	};
};

DBot.RegisterCommand({
	name: 'joinlogs',
	alias: ['leftlogs', 'joinleftlogs', 'connectlog', 'jllogs', 'joinleftlog', 'joinleftlog', 'joinlog', 'leftlog'],
	
	help_args: '',
	desc: 'Lists last 10 known join/disconnects from this server',
	
	func: fn('joinlogs', 40)
});

DBot.RegisterCommand({
	name: 'fjoinlogs',
	alias: ['fleftlogs', 'fjoinleftlogs', 'fconnectlog', 'fjllogs', 'fjoinleftlog', 'fjoinleftlog', 'fjoinlog', 'fleftlog'],
	
	help_args: '',
	desc: 'Lists last 800 known join/disconnects from this server',
	
	func: fn('joinlogs', 800)
});
