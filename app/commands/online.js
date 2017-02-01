
const hDuration = DBot.js.hDuration;
const moment = DBot.js.moment;

// TOTAL_OFFLINE because we must count offline time when bot is online.

hook.Add('SQLInitialize', 'uptime-bot', function() {
	Postgre.query('SELECT * FROM uptime_bot', function(err, data) {
		if (!data || !data[0]) {
			Postgre.query('INSERT INTO uptime_bot VALUES (' + CurTime() + ', 0)');
		}
	});
});

let usersCache = [];

setInterval(function() {
	if (!DBot.IsOnline())
		return;
	
	let finalQuery = '';
	
	for (let user of usersCache) {
		try {
			let status = user.presence.status;
			let ostatus = user.lastStatus;
			
			if (status != ostatus) {
				finalQuery += 'UPDATE users SET "STATUS" = \'' + status + '\' WHERE "ID" = ' + DBot.GetUserID(user) + ';';
				user.lastStatus = status;
			}
		} catch(err) {
			// console.error(err);
		}
	}
	
	finalQuery += 'UPDATE lastonline SET "LASTONLINE" = currtime() FROM users WHERE users."STATUS" != \'offline\' AND users."ID" = lastonline."ID" AND users."TIME" > currtime() - 120;';
	Postgre.query(finalQuery);
}, 5000);

let INIT_BOT = false;
let INIT = false;

hook.Add('UserInitialized', 'LastSeen', function(user) {
	usersCache.push(user);
	
	if (!INIT)
		return;
	
	Postgre.query('INSERT INTO lastonline VALUES (' + user.uid + ', currtime()) ON CONFLICT ("ID") DO UPDATE SET "LASTONLINE" = currtime()', function(err, data) {
		if (err)
			console.error('Failed to create lastonline entry: ' + err);
	});
	
	Postgre.query('INSERT INTO uptime ("ID", "STAMP") VALUES (' + user.uid + ', currtime()) ON CONFLICT ("ID") DO NOTHING', function(err, data) {
		if (err)
			console.error('Failed to create lastonline entry: ' + err);
	});
	
	Postgre.query('UPDATE users SET "STATUS" = \'' + user.presence.status + '\' WHERE "ID" = ' + user.uid, function(err, data) {
		if (err)
			console.error('Failed to create lastonline entry: ' + err);
	});
});

hook.Add('UsersInitialized', 'LastSeen', function() {
	INIT = true;
	
	let users = DBot.GetUsers();
	
	let updateStr;
	let statusStr;
	
	for (let user of users) {
		if (!updateStr)
			updateStr = '(' + (user.uid || sql.User(user)) + ',currtime())';
		else
			updateStr += ',(' + (user.uid || sql.User(user)) + ',currtime())';
		
		try {
			user.lastStatus = user.presence.status;
			
			if (!statusStr)
				statusStr = '(' + (user.uid || sql.User(user)) + ',' + Util.escape(user.lastStatus) + '::discord_user_status)';
			else
				statusStr += ',(' + (user.uid || sql.User(user)) + ',' + Util.escape(user.lastStatus) + '::discord_user_status)';
		} catch(err) {
			
		}
		
	}
	
	if (updateStr) {
		Postgre.query('INSERT INTO lastonline VALUES ' + updateStr + ' ON CONFLICT ("ID") DO UPDATE SET "LASTONLINE" = currtime()');
		Postgre.query('INSERT INTO uptime ("ID", "STAMP") VALUES ' + updateStr + ' ON CONFLICT ("ID") DO NOTHING');
	}
	
	if (statusStr)
		Postgre.query('UPDATE users SET "STATUS" = "m"."STATUS" FROM (VALUES ' + statusStr + ') AS "m"("ID", "STATUS") WHERE users."ID" = "m"."ID"');
});

setInterval(function() {
	if (DBot.IsOnline())
		Postgre.query('UPDATE uptime_bot SET "AMOUNT" = "AMOUNT" + 1');
}, 1000);

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
		
		let uid = DBot.GetUserID(args[0]);
		
		Postgre.query('SELECT "LASTONLINE" FROM lastonline WHERE "ID" = ' + uid, function(err, data) {
			if (err || !data || !data[0]) {
				msg.reply('<internal pony error>');
				return;
			}
			
			let cTime = Math.floor(CurTime());
			let delta = cTime - data[0].LASTONLINE;
			
			let deltaStr = hDuration(delta * 1000);
			let mom = moment.unix(data[0].LASTONLINE + TimezoneOffset());
			
			let formated = mom.format('dddd, MMMM Do YYYY, HH:mm:ss');
			
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
			let uid = DBot.GetUserID(args[0]);
			
			Postgre.query('SELECT * FROM uptime WHERE "ID" = ' + uid, function(err, data) {
				if (err || !data || !data[0]) {
					msg.reply('<internal pony error>');
					return;
				}
				
				let TOTAL_ONLINE = data[0].TOTAL_ONLINE;
				let ONLINE = data[0].ONLINE;
				let AWAY = data[0].AWAY;
				let DNT = data[0].DNT;
				let STAMP = data[0].STAMP;
				let TOTAL_TIME = CurTime() - STAMP;
				let TOTAL_OFFLINE = data[0].TOTAL_OFFLINE;
				let offlinePercent = TOTAL_OFFLINE / (TOTAL_ONLINE + TOTAL_OFFLINE);
				let onlinePercent = 1 - offlinePercent;
				
				let output = '\n```';
				
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
				let TOTAL_ONLINE = data[0].AMOUNT;
				let TOTAL_TIME = CurTime() - data[0].START;
				let TOTAL_OFFLINE = TOTAL_TIME - TOTAL_ONLINE;
				
				let offlinePercent = TOTAL_OFFLINE / TOTAL_TIME;
				let onlinePercent = 1 - offlinePercent;
				
				let output = '\n```';
				
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
