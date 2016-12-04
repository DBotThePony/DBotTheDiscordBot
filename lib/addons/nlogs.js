
/*
CREATE TABLE IF NOT EXISTS `name_logs` (
	`ID` INTEGER NOT NULL,
	`SERVER` INTEGER NOT NULL,
	`NAME` VARCHAR(255) NOT NULL,
	`LASTUSE` INTEGER NOT NULL,
	`TIME` INTEGER NOT NULL,
	PRIMARY KEY (`ID`, `SERVER`, `NAME`)
)
*/

const moment = require('moment');
const utf8 = require('utf8');
const hDuration = require('humanize-duration');

MySQL.query('CREATE TABLE IF NOT EXISTS `name_logs` (`ID` INTEGER NOT NULL, `SERVER` INTEGER NOT NULL, `NAME` VARCHAR(255) NOT NULL, `LASTUSE` INTEGER NOT NULL, `TIME` INTEGER NOT NULL, PRIMARY KEY (`ID`, `SERVER`, `NAME`))');

hook.Add('UpdateMemberVars', 'NameLogs', function(member) {
	try {
		if (!DBot.UserIsInitialized(member.user))
			return;
		
		let uid = DBot.GetUserID(member.user);
		let sid = DBot.GetServerID(member.guild);
		let name = member.nickname || member.user.username;
		let time = CurTime();
		member.NTime = member.NTime || time;
		let delta = Math.floor(time - member.NTime);
		
		if (delta < 1) {
			return; // Wait more
		}
		
		member.NTime = time;
		
		MySQL.query('INSERT INTO `name_logs` (`ID`, `SERVER`, `NAME`, `LASTUSE`, `TIME`) VALUES (' + uid + ', ' + sid + ', ' + Util.escape(name) + ', ' + time + ', ' + delta + ') ON DUPLICATE KEY UPDATE `LASTUSE` = ' + time + ', `TIME` = `TIME` + ' + delta);
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
		
		MySQL.query('SELECT `NAME`, `LASTUSE`, `TIME` FROM `name_logs` WHERE `ID` = ' + DBot.GetUserID(args[0]) + ' AND `SERVER` = ' + DBot.GetServerID(msg.channel.guild) + ' ORDER BY `LASTUSE` DESC', function(err, data) {
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
