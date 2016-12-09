
const hDuration = require('humanize-duration');
const moment = require('moment');

// TOTAL_OFFLINE because we must count offline time when bot is online.

hook.Add('SQLInitialize', 'uptime-bot', function() {
	Postgre.query('SELECT * FROM uptime_bot', function(err, data) {
		if (!data || !data[0]) {
			Postgre.query('INSERT INTO uptime_bot VALUES (' + CurTime() + ', 0)');
		}
	});
});

hook.Add('UpdateUserVars', 'LastSeen', function(user) {
	try {
		var ctime = Math.floor(CurTime());
		
		user.LastSeenTime = user.LastSeenTime || ctime;
		var delta = ctime - user.LastSeenTime;
		user.LastSeenTime = ctime;
		
		if (delta == 0)
			return;
		
		let curStatus = user.presence.status;
		let get = DBot.GetUserID(user);
		
		if (curStatus != 'offline') {
			Postgre.query('UPDATE lastonline SET "LASTONLINE" = ' + ctime + ' WHERE "ID" = ' + get, function(err, data) {
				if (err) {
					console.error('Failed to update lastonline entry: ' + err);
				}
			});
			
			Postgre.query('UPDATE uptime SET "TOTAL_ONLINE" = "TOTAL_ONLINE" + ' + Util.escape(delta) + ' WHERE "ID" = ' + get, function(err, data) {
				if (err) {
					console.error('Failed to update lastonline entry: ' + err);
				}
			});
		} else {
			Postgre.query('UPDATE uptime SET "TOTAL_OFFLINE" = "TOTAL_OFFLINE" + ' + Util.escape(delta) + ' WHERE "ID" = ' + get, function(err, data) {
				if (err) {
					console.error('Failed to update lastonline entry: ' + err);
				}
			});
		}
		
		if (curStatus == 'online') {
			Postgre.query('UPDATE uptime SET "ONLINE" = "ONLINE" + ' + Util.escape(delta) + ' WHERE "ID" = ' + get, function(err, data) {
				if (err) {
					console.error('Failed to update lastonline entry: ' + err);
				}
			});
		} else if (curStatus == 'idle') {
			Postgre.query('UPDATE uptime SET "AWAY" = "AWAY" + ' + Util.escape(delta) + ' WHERE "ID" = ' + get, function(err, data) {
				if (err) {
					console.error('Failed to update lastonline entry: ' + err);
				}
			});
		} else if (curStatus == 'dnd') {
			Postgre.query('UPDATE uptime SET "DNT" = "DNT" + ' + Util.escape(delta) + ' WHERE "ID" = ' + get, function(err, data) {
				if (err) {
					console.error('Failed to update lastonline entry: ' + err);
				}
			});
		}
	} catch(err) {
		console.error(err);
	}
});

hook.Add('UserInitialized', 'LastSeen', function(user) {
	Postgre.query('SELECT "ID" FROM lastonline WHERE "ID" = ' + DBot.GetUserID(user), function(err, data) {
		if (data && data[0])
			return;
		
		Postgre.query('INSERT INTO lastonline VALUES (' + DBot.GetUserID(user) + ', ' + Math.floor(CurTime()) + ')', function(err, data) {
			if (err) {
				console.error('Failed to create lastonline entry: ' + err);
			}
		});
	});
	
	Postgre.query('SELECT "ID" FROM uptime WHERE "ID" = ' + DBot.GetUserID(user), function(err, data) {
		if (data && data[0])
			return;
		
		Postgre.query('INSERT INTO uptime ("ID", "STAMP") VALUES (' + DBot.GetUserID(user) + ', ' + Math.floor(CurTime()) + ')', function(err, data) {
			if (err) {
				console.error('Failed to create lastonline entry: ' + err);
			}
		});
	});
	
	try {
		Postgre.query('INSERT INTO user_status ("ID", "STATUS") VALUES (' + DBot.GetUserID(user) + ', ' + Util.escape(user.presence.status) + ') ON CONFLICT ("ID") DO UPDATE SET "STATUS" = ' + Util.escape(user.presence.status));
	} catch(err) {
		
	}
});

var INIT = false;

hook.Add('BotOnline', 'BotUptime', function() {
	if (INIT)
		return;
	
	INIT = true;
	setInterval(function() {
		Postgre.query('UPDATE uptime_bot SET "AMOUNT" = "AMOUNT" + 1');
	}, 1000);
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
		
		Postgre.query('SELECT LASTONLINE FROM lastonline WHERE "ID" = ' + uid, function(err, data) {
			if (err || !data || !data[0]) {
				msg.reply('<internal pony error>');
				return;
			}
			
			var cTime = Math.floor(CurTime());
			var delta = cTime - data[0].LASTONLINE;
			
			var deltaStr = hDuration(delta * 1000);
			var mom = moment.unix(data[0].LASTONLINE + TimezoneOffset());
			
			var formated = mom.format('dddd, MMMM Do YYYY, HH:mm:ss');
			
			msg.reply('As i remember user <@' + args[0].id + '> was last online at\n"' + formated + ' UTC +0:00" (' + deltaStr + ' ago)');
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
			
			Postgre.query('SELECT * FROM uptime WHERE "ID" = ' + uid, function(err, data) {
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
				var offlinePercent = TOTAL_OFFLINE / (TOTAL_ONLINE + TOTAL_OFFLINE);
				var onlinePercent = 1 - offlinePercent;
				
				var output = '\n```';
				
				output += 'User:                           @' + args[0].username + ' <@' + args[0].id + '>\n';
				output += 'Total online time:              ' + hDuration(Math.floor(TOTAL_ONLINE) * 1000) + '\n';
				output += 'Total offline time:             ' + hDuration(Math.floor(TOTAL_OFFLINE) * 1000) + '\n';
				output += 'Online percent:                 ' + (Math.floor(onlinePercent * 10000) / 100) + '%\n';
				output += 'Total time "online":            ' + hDuration(Math.floor(ONLINE) * 1000) + '\n';
				output += 'Total time "away":              ' + hDuration(Math.floor(AWAY) * 1000) + '\n';
				output += 'Total time "dnd":               ' + hDuration(Math.floor(DNT) * 1000) + '\n';
				output += 'Total time tracked:             ' + hDuration(Math.floor(TOTAL_TIME) * 1000) + '\n';
				output += '\n';
				output += 'Start of track: ' + moment.unix(STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + '\n';
				output += 'Data is *not* accurate because i can be offline sometimes\n';
				
				output += '```';
				
				msg.channel.sendMessage(output);
			});
		} else {
			Postgre.query('SELECT * FROM uptime_bot', function(err, data) {
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
