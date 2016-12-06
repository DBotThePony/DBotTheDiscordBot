
var fs = require('fs');
var unirest = require('unirest');
var base = 'https://steamcommunity-a.akamaihd.net/economy/emoticon/';
Util.mkdir(DBot.WebRoot + '/steam_emoji');

var toReplace = new RegExp(':', 'g');

module.exports = {
	name: 'semoji',
	alias: ['se'],
	
	help_args: '<name>',
	desc: 'Posts a steam emoji',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'You need at least one emoji';
		
		var STOP = false;
		
		msg.channel.startTyping();
		
		for (let arg of args) {
			let str = arg.replace(toReplace, '');
			
			MySQL.query('SELECT EMOJI FROM steam_emoji_fail WHERE EMOJI = ' + MySQL.escape(str), function(err, data) {
				if (STOP)
					return;
				
				if (data[0] && data[0].EMOJI) {
					msg.channel.stopTyping();
					msg.reply('Invalid emoji: ' + str);
				} else {
					var fpath = DBot.WebRoot + '/steam_emoji/' + str + '.png';
					
					fs.stat(fpath, function(err, stat) {
						if (STOP)
							return;
						
						if (stat) {
							fs.readFile(fpath, {encoding: null}, function(err, data) {
								if (STOP)
									return;
								
								msg.channel.sendFile(data, str + '.png').catch(function() {
									if (STOP)
										return;
									
									msg.channel.stopTyping();
									STOP = true;
									msg.reply('No permissions to upload files!');
								});
							});
						} else {
							unirest.get(base + str)
							.encoding(null)
							.end(function(result) {
								if (result.raw_body.toString() == '') {
									STOP = true;
									msg.reply('Invalid Emoji: ' + str + '!');
									MySQL.query('INSERT INTO steam_emoji_fail VALUES (' + MySQL.escape(str) + ')');
									msg.channel.stopTyping();
								} else {
									fs.writeFile(fpath, result.raw_body, function(err) {
										msg.channel.sendFile(result.raw_body, str + '.png')
										.catch(function() {
											if (STOP)
												return;
											
											msg.channel.stopTyping();
											STOP = true;
											msg.reply('No permissions to upload files!');
										});
									});
								}
							});
						}
					});
				}
			});
		}
	}
}
