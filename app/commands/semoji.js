
const fs = require('fs');
const unirest = require('unirest');
const base64 = require('base-64');
const base = 'https://steamcommunity-a.akamaihd.net/economy/emoticon/';
Util.mkdir(DBot.WebRoot + '/steam_emoji');
Util.mkdir(DBot.WebRoot + '/steam_emoji_large');

const toReplace = new RegExp(':', 'g');

module.exports = {
	name: 'semoji',
	alias: ['se'],
	
	help_args: '<name>',
	desc: 'Posts a steam emoji',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'You need at least one emoji';
		
		let STOP = false;
		
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
								
								msg.channel.sendFile(data, str + '.png')
								.then(function() {
									msg.channel.stopTyping();
								})
								.catch(function() {
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

const findImg = /base64,([^"]+)/i;

DBot.RegisterCommand({
	name: 'slemoji',
	alias: ['sle'],
	
	help_args: '<name>',
	desc: 'Posts a large steam emoji',
	
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
					var fpath = DBot.WebRoot + '/steam_emoji_large/' + str + '.png';
					
					fs.stat(fpath, function(err, stat) {
						if (STOP)
							return;
						
						if (stat) {
							fs.readFile(fpath, {encoding: null}, function(err, data) {
								if (STOP)
									return;
								
								msg.channel.sendFile(data, str + '.png')
								.then(function() {
									msg.channel.stopTyping();
								})
								.catch(function() {
									if (STOP)
										return;
									
									msg.channel.stopTyping();
									STOP = true;
									msg.reply('No permissions to upload files!');
								});
							});
						} else {
							unirest.get('http://steamcommunity-a.akamaihd.net/economy/emoticonhover/' + str + '/jsonp.js?callback=ld')
							.encoding(null)
							.end(function(result) {
								if (result.raw_body.toString() == '') {
									STOP = true;
									msg.reply('Invalid Emoji: ' + str + '!');
									MySQL.query('INSERT INTO steam_emoji_fail VALUES (' + MySQL.escape(str) + ')');
									msg.channel.stopTyping();
								} else {
									let body = result.raw_body.toString();
									let find = body.match(findImg);
									
									if (!find) {
										msg.reply('WTF');
										msg.channel.stopTyping();
										return;
									}
									
									let decoded = Buffer.from(find[1].replace(/\\/g, ''), 'base64');
									
									fs.writeFile(fpath, decoded, function(err) {
										msg.channel.sendFile(decoded, str + '.png')
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
});
