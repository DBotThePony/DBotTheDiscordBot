
/*

CREATE TABLE IF NOT EXISTS `joinleft_log` (
	`ID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`USER` INTEGER NOT NULL,
	`SERVER` INTEGER NOT NULL,
	`STAMP` INTEGER NOT NULL,
	`STATUS` BOOLEAN NOT NULL
)

*/

const moment = require('moment');
const utf8 = require('utf8');
const hDuration = require('humanize-duration');

MySQL.query('CREATE TABLE IF NOT EXISTS `joinleft_log` (`ID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,`USER` INTEGER NOT NULL,`SERVER` INTEGER NOT NULL,`STAMP` INTEGER NOT NULL,`STATUS` BOOLEAN NOT NULL)');

hook.Add('ValidClientJoinsServer', 'JLogs', function(user, server, member) {
	setTimeout(function() {
		MySQL.query('INSERT INTO `joinleft_log` (`USER`, `SERVER`, `STAMP`, `STATUS`) VALUES (' + DBot.GetUserID(user) + ', ' + DBot.GetServerID(server) + ', ' + CurTime() + ', 1)');
	}, 1000);
});

hook.Add('ValidClientLeftServer', 'JLogs', function(user, server, member) {
	setTimeout(function() {
		MySQL.query('INSERT INTO `joinleft_log` (`USER`, `SERVER`, `STAMP`, `STATUS`) VALUES (' + DBot.GetUserID(user) + ', ' + DBot.GetServerID(server) + ', ' + CurTime() + ', 0)');
	}, 1000);
});

DBot.RegisterCommand({
	name: 'joinlogs',
	alias: ['leftlogs', 'joinleftlogs', 'connectlog', 'jllogs', 'joinleftlog', 'joinleftlog', 'joinlog', 'leftlog'],
	
	help_args: '',
	desc: 'Lists all known join/disconnects from this server',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		MySQL.query('SELECT `joinleft_log`.`STAMP`, `joinleft_log`.`STATUS`, `user_names`.`USERNAME` as `USERNAME` FROM `joinleft_log`, `user_names` WHERE `joinleft_log`.`SERVER` = ' + DBot.GetServerID(msg.channel.guild) + ' AND `user_names`.`ID` = `joinleft_log`.`USER` ORDER BY `joinleft_log`.`ID` DESC', function(err, data) {
			if (err) {
				msg.reply('WTF');
				return;
			}
			
			if (!data || !data[0]) {
				msg.reply('No data is returned in query');
				return;
			}
			
			let output = '```\n' + Util.AppendSpaces('User', 20) + Util.AppendSpaces('Type', 16) + Util.AppendSpaces('Time', 30) + '\n';
			
			for (let row of data) {
				let date = moment.unix(row.STAMP);
				let status = row.STATUS;
				let name = utf8.decode(row.USERNAME);
				
				output += Util.AppendSpaces(name, 20) + Util.AppendSpaces(status && 'Connect' || 'Disconnect', 16) + Util.AppendSpaces(date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ' ago)', 30) + '\n';
			}
			
			output += '\n```';
			
			msg.reply(output);
		});
	}
});
