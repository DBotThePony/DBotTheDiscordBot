
const hDuration = require('humanize-duration');
const moment = require('moment');

DBot.DefineMySQLTable('lastonline', '`ID` INTEGER NOT NULL, `LASTONLINE` INTEGER NOT NULL, PRIMARY KEY (`ID`)');

MySQL.query('CREATE TABLE IF NOT EXISTS `uptime` (\
	`ID` INTEGER NOT NULL PRIMARY KEY,\
	`TOTAL_ONLINE` INTEGER NOT NULL DEFAULT 0,\
	`TOTAL_OFFLINE` INTEGER NOT NULL DEFAULT 0,\
	`ONLINE` INTEGER NOT NULL DEFAULT 0,\
	`AWAY` INTEGER NOT NULL DEFAULT 0,\
	`DNT` INTEGER NOT NULL DEFAULT 0,\
	`STAMP` INTEGER NOT NULL\
)');

// TOTAL_OFFLINE because we must count offline time when bot is online.

MySQL.query('CREATE TABLE IF NOT EXISTS `uptime_bot` (\
	`START` INTEGER NOT NULL,\
	`AMOUNT` INTEGER NOT NULL\
)', function() {
	MySQL.query('SELECT * FROM `uptime_bot`', function(err, data) {
		if (!data || !data[0]) {
			MySQL.query('INSERT INTO `uptime_bot` VALUES (' + CurTime() + ', 0)');
		}
	});
});

var UpdateFunc = function() {
	MySQL.query('UPDATE `uptime_bot` SET `AMOUNT` = `AMOUNT` + 5');
	var Users = DBot.GetUsers();
	var ctime = Math.floor(CurTime());
	
	// Might we are saving stuff when there are a user that is not initialized
	try {
		for (let i in Users) {
			let curStatus = Users[i].presence.status;
			let get = DBot.GetUserID(Users[i]);
			
			if (curStatus != 'offline') {
				MySQL.query('UPDATE `lastonline` SET `LASTONLINE` = ' + ctime + ' WHERE `ID` = ' + get, function(err, data) {
					if (err) {
						console.error('Failed to update lastonline entry: ' + err);
					}
				});
				
				MySQL.query('UPDATE `uptime` SET `TOTAL_ONLINE` = `TOTAL_ONLINE` + 5 WHERE `ID` = ' + get, function(err, data) {
					if (err) {
						console.error('Failed to update lastonline entry: ' + err);
					}
				});
			} else {
				MySQL.query('UPDATE `uptime` SET `TOTAL_OFFLINE` = `TOTAL_OFFLINE` + 5 WHERE `ID` = ' + get, function(err, data) {
					if (err) {
						console.error('Failed to update lastonline entry: ' + err);
					}
				});
			}
			
			if (curStatus == 'online') {
				MySQL.query('UPDATE `uptime` SET `ONLINE` = `ONLINE` + 5 WHERE `ID` = ' + get, function(err, data) {
					if (err) {
						console.error('Failed to update lastonline entry: ' + err);
					}
				});
			} else if (curStatus == 'idle') {
				MySQL.query('UPDATE `uptime` SET `AWAY` = `AWAY` + 5 WHERE `ID` = ' + get, function(err, data) {
					if (err) {
						console.error('Failed to update lastonline entry: ' + err);
					}
				});
			} else if (curStatus == 'dnd') {
				MySQL.query('UPDATE `uptime` SET `DNT` = `DNT` + 5 WHERE `ID` = ' + get, function(err, data) {
					if (err) {
						console.error('Failed to update lastonline entry: ' + err);
					}
				});
			}
		}
	} catch(err) {
		
	}
}

hook.Add('UserInitialized', 'LastSeen', function(user) {
	MySQL.query('SELECT `ID` FROM `lastonline` WHERE `ID` = ' + DBot.GetUserID(user), function(err, data) {
		if (data && data[0])
			return;
		
		MySQL.query('INSERT INTO `lastonline` VALUES (' + DBot.GetUserID(user) + ', ' + Math.floor(CurTime()) + ')', function(err, data) {
			if (err) {
				console.error('Failed to create lastonline entry: ' + err);
			}
		});
	});
	
	MySQL.query('SELECT `ID` FROM `uptime` WHERE `ID` = ' + DBot.GetUserID(user), function(err, data) {
		if (data && data[0])
			return;
		
		MySQL.query('INSERT INTO `uptime` (`ID`, `STAMP`) VALUES (' + DBot.GetUserID(user) + ', ' + Math.floor(CurTime()) + ')', function(err, data) {
			if (err) {
				console.error('Failed to create lastonline entry: ' + err);
			}
		});
	});
});

var INIT = false;

hook.Add('BotOnline', 'LastSeen', function() {
	if (INIT)
		return;
	
	INIT = true;
	setInterval(UpdateFunc, 5000);
});

module.exports = {
	name: 'online',
	alias: ['lastonline', 'lonline'],
	
	help_args: '<user>',
	desc: 'Tries to remember when user was last online',
	allowUserArgument: true,
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (typeof args[0] != 'object')
			return 'Must be an user ;n;';
		
		if (args[0].presence.status != 'offline')
			return 'User is online i think?';
		
		var uid = DBot.GetUserID(args[0]);
		
		MySQL.query('SELECT `LASTONLINE` FROM `lastonline` WHERE `ID` = ' + uid, function(err, data) {
			if (err || !data || !data[0]) {
				msg.reply('<internal pony error>');
				return;
			}
			
			var cTime = Math.floor(CurTime());
			var delta = cTime - data[0].LASTONLINE;
			
			var deltaStr = hDuration(delta * 1000);
			var mom = moment.unix(data[0].LASTONLINE + TimezoneOffset());
			
			var formated = mom.format('dddd, MMMM Do YYYY, HH:mm:ss');
			
			msg.reply('As i remember user <@' + args[0].id + '> was last online at\n`' + formated + ' UTC +0:00` (' + deltaStr + ' ago)');
		});
	}
}

DBot.RegisterCommand({
	name: 'uptime',
	
	help_args: '[user]',
	desc: 'Tries to remember how much user is online',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (typeof args[0] == 'object') {
			var uid = DBot.GetUserID(args[0]);
			
			MySQL.query('SELECT * FROM `uptime` WHERE `ID` = ' + uid, function(err, data) {
				if (err || !data || !data[0]) {
					msg.reply('<internal pony error>');
					return;
				}
				
				var TOTAL_ONLINE = data[0].TOTAL_ONLINE;
				var ONLINE = data[0].ONLINE;
				var AWAY = data[0].AWAY;
				var DNT = data[0].DNT;
				var STAMP = data[0].STAMP;
				var TOTAL_TIME = CurTime() - STAMP;
				var TOTAL_OFFLINE = data[0].TOTAL_OFFLINE;
				var offlinePercent = TOTAL_OFFLINE / TOTAL_TIME;
				var onlinePercent = 1 - offlinePercent;
				
				var output = '\n```';
				
				output += 'User:                           @' + args[0].username + ' <@' + args[0].id + '>\n';
				output += 'Total online time:              ' + hDuration(Math.floor(TOTAL_ONLINE) * 1000) + '\n';
				output += 'Total offline time:             ' + hDuration(Math.floor(TOTAL_OFFLINE) * 1000) + '\n';
				output += 'Online percent:                 ' + (Math.floor(onlinePercent * 10000) / 100) + '%\n';
				output += 'Total away time:                ' + hDuration(Math.floor(AWAY) * 1000) + '\n';
				output += 'Total DND time:                 ' + hDuration(Math.floor(DNT) * 1000) + '\n';
				output += 'Total time tracked:             ' + hDuration(Math.floor(TOTAL_TIME) * 1000) + '\n';
				output += '\n';
				output += 'Start of track: ' + moment.unix(STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + '\n';
				output += 'Data is *not* accurate because i can be offline sometimes\n';
				
				output += '```';
				
				msg.channel.sendMessage(output);
			});
		} else {
			MySQL.query('SELECT * FROM `uptime_bot`', function(err, data) {
				var TOTAL_ONLINE = data[0].AMOUNT;
				var TOTAL_TIME = CurTime() - data[0].START;
				var TOTAL_OFFLINE = TOTAL_TIME - TOTAL_ONLINE;
				
				var offlinePercent = TOTAL_OFFLINE / TOTAL_TIME;
				var onlinePercent = 1 - offlinePercent;
				
				var output = '\n```';
				
				output += '--------- My uptime statistics\n';
				output += 'Current session uptime:         ' + hDuration(Math.floor((CurTime() - DBot.START_STAMP)) * 1000) + '\n';
				output += 'Total online time:              ' + hDuration(Math.floor(TOTAL_ONLINE) * 1000) + '\n';
				output += 'Total offline time:             ' + hDuration(Math.floor(TOTAL_OFFLINE) * 1000) + '\n';
				output += 'Online percent:                 ' + (Math.floor(onlinePercent * 10000) / 100) + '%\n';
				
				output += '```';
				msg.channel.sendMessage(output);
			});
		}
	}
});
