
let apiBase = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A6705637E4E80BD04C8471C143C91DBE&steamids=';
let resolveBase = 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=A6705637E4E80BD04C8471C143C91DBE&vanityurl=';
let unirest = DBot.js.unirest;
let BigNumber = require('bignumber.js');

let SteamIDTo64 = function(id) {
	let server = 0;
	let AuthID = 0;
	
	let split = id.split(':');
	
	let server = Util.ToNumber(split[1]);
	let AuthID = Util.ToNumber(split[2]);
	
	let Mult = AuthID * 2;
	
	let one = new BigNumber('76561197960265728');
	let two = new BigNumber(Mult);
	let three = new BigNumber(server);
	
	return one.plus(two).plus(three).toString(10);
}

let SteamIDFrom64 = function(id) {
	let newNum = new BigNumber(id);
	let num = Util.ToNumber(newNum.minus(new BigNumber('76561197960265728')).toString(10));
	
	let server = num % 2;
	num = num - server;
	
	return 'STEAM_0:' + server + ':' + (num / 2);
}

let SteamIDTo3 = function(id) {
	let server = 0;
	let AuthID = 0;
	
	let split = id.split(':');
	
	let server = Util.ToNumber(split[1]);
	let AuthID = Util.ToNumber(split[2]);
	
	return '[U:1:' + (AuthID * 2 + server) + ']';
}

let SteamIDFrom3 = function(id) {
	let sub = id.substr(1, id.length - 2);
	let split = sub.split(':');
	
	let uid = Util.ToNumber(split[2]);
	if (!uid)
		return false;
	
	let server = uid % 2;
	uid = uid - server;
	
	return 'STEAM_0:' + server + ':' + (uid / 2);
}

let manipulateRegExp = new RegExp('/', 'g');

module.exports = {
	name: 'steamid',
	alias: ['steam'],
	
	help_args: '<steamid>',
	desc: 'Get a SteamID infos',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Argument must be a valid SteamID, SteamID3, SteamID64 or Custom profile URL' + Util.HighlightHelp(['steamid'], 2, args);
		
		let toManipulate = args[0];
		toManipulate = toManipulate
			.replace('http://steamcommunity.com/id/', '')
			.replace('https://steamcommunity.com/id/', '')
			.replace('https://steamcommunity.com/profile/', '')
			.replace('http://steamcommunity.com/profile/', '')
			.replace(manipulateRegExp, '');
		
		let validID = Util.ToNumber(toManipulate);
		
		let SteamID = '';
		let SteamID3 = '';
		let SteamID64 = '';
		let CustomProfileURL = '';
		
		msg.channel.startTyping();
		
		let continueFunc = function() {
			msg.channel.stopTyping();
			let output = '\n';
			
			output += 'Player SteamID(32): `' + SteamID + '`\n';
			output += 'Player SteamID3: `' + SteamID3 + '`\n';
			output += 'Player SteamID64: `' + SteamID64 + '`\n';
			output += 'Player Profile URL: https://steamcommunity.com/id/' + CustomProfileURL + '\n';
			
			msg.reply(output);
		}
		
		let getFunc = function(id) {
			MySQL.query('SELECT * FROM steamid_fail WHERE "STEAMID64" = ' + Util.escape(id) + '', function(err, data2) {
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					return;
				}
				
				if (data2[0]) {
					msg.channel.stopTyping();
					msg.reply('No such Steam account: ' + id);
					return
				}
				
				MySQL.query('SELECT * FROM steamid WHERE "STEAMID64" = ' + Util.escape(id) + '', function(err, data) {
					if (data && data[0]) {
						SteamID = data[0].STEAMID;
						SteamID64 = data[0].STEAMID64;
						SteamID3 = data[0].STEAMID3;
						CustomProfileURL = data[0].CUSTOMID;
						continueFunc();
					} else {
						unirest.get(apiBase + id)
						.end(function(result) {
							let data = result.body.response.players;
							
							if (!data[0]) {
								MySQL.query('INSERT INTO steamid_fail ("STEAMID64") VALUES (' + Util.escape(id) + ')');
								msg.reply('No such steam account: ' + id);
								msg.channel.stopTyping();
								return;
							}
							
							let ply = data[0];
							let profileurl = ply.profileurl;
							let steamid = SteamIDFrom64(id);
							let steamid3 = SteamIDTo3(steamid);
							
							let profile = profileurl.replace('http://steamcommunity.com/id/', '').replace('/', '');
							
							CustomProfileURL = profile;
							SteamID = steamid;
							SteamID3 = steamid3;
							SteamID64 = id;
							
							MySQL.query('INSERT INTO steamid VALUES\
							(' + Util.escape(SteamID64) + ', ' + Util.escape(SteamID) + ', ' + Util.escape(SteamID3) + ', ' + Util.escape(profile) + ') ON CONFLICT ("STEAMID64") DO UPDATE SET\
							"STEAMID64" = ' + Util.escape(SteamID64) + ',\
							"STEAMID" = ' + Util.escape(SteamID) + ',\
							"STEAMID3" = ' + Util.escape(SteamID3) + ',\
							"CUSTOMID" = ' + Util.escape(profile));
							
							continueFunc();
						});
					}
				});
			});
		}
		
		if (toManipulate.substr(0, 2) == '[U') {
			// assume this is SteamID3
			let steamid = SteamIDFrom3(toManipulate);
			getFunc(steamid);
		} else if (toManipulate.substr(0, 7) == 'STEAM_0') {
			// assume this is SteamID
			let steamid = SteamIDTo64(toManipulate);
			getFunc(steamid);
		} else if (validID) {
			// assume this is SteamID64
			getFunc(toManipulate);
		} else {
			// assume this is Custom Steam Profile
			
			MySQL.query('SELECT * FROM steamid_fail WHERE "CUSTOMID" = ' + Util.escape(toManipulate), function(err, data2) {
				if (data2[0]) {
					msg.channel.stopTyping();
					msg.reply('No such Steam account: ' + toManipulate);
					return
				}
				
				MySQL.query('SELECT * FROM steamid WHERE "CUSTOMID" = ' + Util.escape(toManipulate), function(err, data) {
					if (data && data[0]) {
						SteamID = data[0].STEAMID;
						SteamID64 = data[0].STEAMID64;
						SteamID3 = data[0].STEAMID3;
						CustomProfileURL = data[0].CUSTOMID;
						continueFunc();
					} else {
						unirest.get(resolveBase + encodeURIComponent(toManipulate))
						.end(function(result) {
							let res = result.body;
							
							if (!res.response || res.response.success == 42) {
								MySQL.query('INSERT INTO steamid_fail ("CUSTOMID") VALUES (' + Util.escape(toManipulate) + ')');
								msg.reply('No such Steam account: ' + toManipulate);
								msg.channel.stopTyping();
							} else {
								let uid = res.response.steamid;
								
								getFunc(uid);
							}
						});
					}
				});
			});
		}
	}
};

