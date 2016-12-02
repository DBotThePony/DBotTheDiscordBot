
var hDuration = require('humanize-duration');
var moment = require('moment');

DBot.DefineMySQLTable('lastonline', '`ID` INTEGER NOT NULL, `LASTONLINE` INTEGER NOT NULL, PRIMARY KEY (`ID`)');

var UpdateFunc = function() {
	var Users = DBot.bot.users.array();
	var ctime = Math.floor(CurTime());
	
	// Might we are saving stuff when there are a user that is not initialized
	try {
		for (var i in Users) {
			var curStatus = Users[i].presence.status;
			if (curStatus != 'offline') {
				var get = DBot.GetUserID(Users[i]);
				
				MySQL.query('UPDATE `lastonline` SET `LASTONLINE` = ' + ctime + ' WHERE `ID` = ' + get, function(err, data) {
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
});

var INIT = false;

hook.Add('BotOnline', 'LastSeen', function() {
	if (INIT)
		return;
	
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
