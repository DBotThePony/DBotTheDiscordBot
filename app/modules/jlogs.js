
const moment = require('moment');
const fs = DBot.js.filesystem;
const hDuration = require('humanize-duration');

Util.mkdir(DBot.WebRoot + '/jlogs');

hook.Add('ValidClientJoinsServer', 'JLogs', function(user, server, member) {
	MySQL.query('INSERT INTO joinleft_log ("USER", "SERVER", "STAMP", "STATUS") VALUES (' + sql.User(user) + ', ' + sql.Server(server) + ', ' + CurTime() + ', true)');
});

hook.Add('ValidClientLeftServer', 'JLogs', function(user, server, member) {
	MySQL.query('INSERT INTO joinleft_log ("USER", "SERVER", "STAMP", "STATUS") VALUES (' + sql.User(user) + ', ' + sql.Server(server) + ', ' + CurTime() + ', false)');
});

DBot.RegisterCommand({
	name: 'joinlogs',
	alias: ['leftlogs', 'joinleftlogs', 'connectlog', 'jllogs', 'joinleftlog', 'joinleftlog', 'joinlog', 'leftlog'],
	
	help_args: '',
	desc: 'Lists last 10 known join/disconnects from this server',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		msg.channel.startTyping();
		
		MySQL.query('SELECT joinleft_log."STAMP", joinleft_log."STATUS", users."NAME" as "USERNAME" FROM joinleft_log, users WHERE joinleft_log."SERVER" = ' + DBot.GetServerID(msg.channel.guild) + ' AND users."ID" = joinleft_log."USER" ORDER BY joinleft_log."ID" DESC LIMIT 10', function(err, data) {
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
			
			let output = '```\n' + Util.AppendSpaces('User', 20) + Util.AppendSpaces('Type', 16) + Util.AppendSpaces('Time', 30) + '\n';
			
			for (let row of data) {
				let date = moment.unix(row.STAMP);
				let status = row.STATUS;
				let name = row.USERNAME;
				
				output += Util.AppendSpaces(name, 20) + Util.AppendSpaces(status && 'Connect' || 'Disconnect', 16) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)', 30) + '\n';
			}
			
			output += '\n```';
			
			msg.channel.stopTyping();
			msg.reply(output);
		});
	}
});

DBot.RegisterCommand({
	name: 'fjoinlogs',
	alias: ['fleftlogs', 'fjoinleftlogs', 'fconnectlog', 'fjllogs', 'fjoinleftlog', 'fjoinleftlog', 'fjoinlog', 'fleftlog'],
	
	help_args: '',
	desc: 'Lists last 400 known join/disconnects from this server',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		msg.channel.startTyping();
		
		MySQL.query('SELECT joinleft_log."STAMP", joinleft_log."STATUS", users."NAME" as "USERNAME" FROM joinleft_log, users WHERE joinleft_log."SERVER" = ' + DBot.GetServerID(msg.channel.guild) + ' AND users."ID" = joinleft_log."USER" ORDER BY joinleft_log."ID" DESC LIMIT 400', function(err, data) {
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
			
			let hash = String.hash(CurTime().toString());
			let stream = fs.createWriteStream(DBot.WebRoot + '/jlogs/' + hash + '.txt');
			stream.write('\n' + Util.AppendSpaces('User', 40) + Util.AppendSpaces('Type', 20) + Util.AppendSpaces('Time', 30) + '\n');
			
			for (let row of data) {
				let date = moment.unix(row.STAMP);
				let status = row.STATUS;
				let name = row.USERNAME;
				
				stream.write(Util.AppendSpaces(name, 40) + Util.AppendSpaces(status && 'Connect' || 'Disconnect', 20) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)', 30) + '\n');
			}
			
			stream.end();
			
			stream.on('finish', function() {
				msg.channel.stopTyping();
				msg.reply(DBot.URLRoot + '/jlogs/' + hash + '.txt');
			});
		});
	}
});
