
var apiBase = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=A6705637E4E80BD04C8471C143C91DBE&steamids=';
var resolveBase = 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=A6705637E4E80BD04C8471C143C91DBE&vanityurl=';
var unirest = require('unirest');
var BigNumber = require('bignumber.js');

DBot.DefineMySQLTable('steamid_fail', '`STEAMID64` CHAR(64), `STEAMID` CHAR(32), `STEAMID3` CHAR(32), `CUSTOMID` VARCHAR(128)');
DBot.DefineMySQLTable('steamid', '`STEAMID64` CHAR(64) NOT NULL PRIMARY KEY, `STEAMID` CHAR(32) NOT NULL, `STEAMID3` CHAR(32) NOT NULL, `CUSTOMID` VARCHAR(128) NOT NULL');

var SteamIDTo64 = function(id) {
	var server = 0;
	var AuthID = 0;
	
	var split = id.split(':');
	
	var server = Util.ToNumber(split[1]);
	var AuthID = Util.ToNumber(split[2]);
	
	var Mult = AuthID * 2;
	
	var one = new BigNumber('76561197960265728');
	var two = new BigNumber(Mult);
	var three = new BigNumber(server);
	
	return one.plus(two).plus(three).toString(10);
}

var SteamIDFrom64 = function(id) {
	var newNum = new BigNumber(id);
	var num = Util.ToNumber(newNum.minus(new BigNumber('76561197960265728')).toString(10));
	
	var server = num % 2;
	num = num - server;
	
	return 'STEAM_0:' + server + ':' + (num / 2);
}

var SteamIDTo3 = function(id) {
	var server = 0;
	var AuthID = 0;
	
	var split = id.split(':');
	
	var server = Util.ToNumber(split[1]);
	var AuthID = Util.ToNumber(split[2]);
	
	return '[U:1:' + (AuthID * 2 + server) + ']';
}

var SteamIDFrom3 = function(id) {
	var sub = id.substr(1, id.length - 2);
	var split = sub.split(':');
	
	var uid = Util.ToNumber(split[2]);
	if (!uid)
		return false;
	
	var server = uid % 2;
	uid = uid - server;
	
	return 'STEAM_0:' + server + ':' + (uid / 2);
}

module.exports = {
	name: 'steamid',
	alias: ['steam'],
	
	help_args: '<steamid>',
	desc: 'Get a SteamID infos',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Argument must be a valid SteamID, SteamID3, SteamID64 or Custom profile URL' + Util.HighlightHelp(['steamid'], 2, args);
		
		var toManipulate = args[0];
		toManipulate = toManipulate
		.replace('http://steamcommunity.com/id/', '')
		.replace('https://steamcommunity.com/id/', '')
		.replace('https://steamcommunity.com/profile/', '')
		.replace('http://steamcommunity.com/profile/', '')
		.replace(new RegExp('/', 'g'), '');
		
		var validID = Util.ToNumber(toManipulate);
		
		var SteamID = '';
		var SteamID3 = '';
		var SteamID64 = '';
		var CustomProfileURL = '';
		
		var continueFunc = function() {
			var output = '\n';
			
			output += 'Player SteamID(32): `' + SteamID + '`\n';
			output += 'Player SteamID3: `' + SteamID3 + '`\n';
			output += 'Player SteamID64: `' + SteamID64 + '`\n';
			output += 'Player Profile URL: https://steamcommunity.com/id/' + CustomProfileURL + '\n';
			
			msg.reply(output);
		}
		
		var getFunc = function(id) {
			MySQL.query('SELECT * FROM `steamid_fail` WHERE `STEAMID64` = "' + id + '"', function(err, data2) {
				if (err) {
					console.error(err);
					return;
				}
				
				if (data2[0]) {
					msg.reply('No such Steam account: ' + id);
					return
				}
				
				MySQL.query('SELECT * FROM `steamid` WHERE `STEAMID64` = "' + id + '"', function(err, data) {
					if (data && data[0]) {
						SteamID = data[0].STEAMID;
						SteamID64 = data[0].STEAMID64;
						SteamID3 = data[0].STEAMID3;
						CustomProfileURL = data[0].CUSTOMID;
						continueFunc();
					} else {
						unirest.get(apiBase + id)
						.end(function(result) {
							var data = result.body.response.players;
							
							if (!data[0]) {
								MySQL.query('INSERT INTO `steamid_fail` (`STEAMID64`) VALUES ("' + id + '")');
								msg.reply('No such steam account: ' + id);
							}
							
							var ply = data[0];
							var profileurl = ply.profileurl;
							var steamid = SteamIDFrom64(id);
							var steamid3 = SteamIDTo3(steamid);
							
							var profile = profileurl.replace('http://steamcommunity.com/id/', '').replace('/', '');
							
							CustomProfileURL = profile;
							SteamID = steamid;
							SteamID3 = steamid3;
							SteamID64 = id;
							
							MySQL.query('REPLACE INTO `steamid` VALUES (' + MySQL.escape(SteamID64) + ', ' + MySQL.escape(SteamID) + ', ' + MySQL.escape(SteamID3) + ', ' + MySQL.escape(profile) + ')');
							
							continueFunc();
						});
					}
				});
			});
		}
		
		if (toManipulate.substr(0, 2) == '[U') {
			// assume this is SteamID3
			var steamid = SteamIDFrom3(toManipulate);
			getFunc(steamid);
		} else if (toManipulate.substr(0, 7) == 'STEAM_0') {
			// assume this is SteamID
			var steamid = SteamIDTo64(toManipulate);
			getFunc(steamid);
		} else if (validID) {
			// assume this is SteamID64
			getFunc(toManipulate);
		} else {
			// assume this is Custom Steam Profile
			
			MySQL.query('SELECT * FROM `steamid_fail` WHERE `CUSTOMID` = ' + MySQL.escape(toManipulate), function(err, data2) {
				if (data2[0]) {
					msg.reply('No such Steam account: ' + toManipulate);
					return
				}
				
				MySQL.query('SELECT * FROM `steamid` WHERE `CUSTOMID` = ' + MySQL.escape(toManipulate), function(err, data) {
					if (data && data[0]) {
						SteamID = data[0].STEAMID;
						SteamID64 = data[0].STEAMID64;
						SteamID3 = data[0].STEAMID3;
						CustomProfileURL = data[0].CUSTOMID;
						continueFunc();
					} else {
						unirest.get(resolveBase + encodeURIComponent(toManipulate))
						.end(function(result) {
							var res = result.body;
							
							if (!res.response || res.response.success == 42) {
								MySQL.query('INSERT INTO `steamid_fail` (`CUSTOMID`) VALUES (' + MySQL.escape(toManipulate) + ')');
								msg.reply('No such Steam account: ' + toManipulate);
							} else {
								var uid = res.response.steamid;
								
								getFunc(uid);
							}
						});
					}
				});
			});
		}
	}
};

