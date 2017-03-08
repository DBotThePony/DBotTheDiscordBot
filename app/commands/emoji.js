
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;
const emoji = require('../lib/emoji.js');

Util.mkdir(DBot.WebRoot + '/emoji');

const avaliableCharEmoji = emoji.charEmoji;
const avaliableCharEmojiMap = emoji.charEmojiMap;

const regExpObj = emoji.regExp;
const customEmoji = emoji.customRegExp;
const map = emoji.map;

const emojiBase = 'https://cdn.discordapp.com/emojis/';
const crypto = require('crypto');
const fs = require('fs');
const child_process = require('child_process');
const spawn = child_process.spawn;

module.exports = {
	name: 'emoji',
	alias: ['e'],
	
	help_args: '<...>',
	desc: 'Emoji into image!',
	
	func: function(args, cmd, msg) {
		if (cmd === '')
			return 'No smileys? ;n;';
		
		let emojiCollection = [];
		let emojiMatch = cmd.match(regExpObj);
		let customEmojiAmount = 0;
		
		msg.channel.startTyping();
		
		const continueFunc = function() {
			if (!emojiCollection[0]) {
				msg.channel.stopTyping();
				msg.reply('No emoji found in this text ;w;');
				return;
			}
			
			if (emojiCollection.length > 50) {
				msg.channel.stopTyping();
				msg.reply('Too many smileys ;n;');
				return;
			}
			
			const hash = crypto.createHash('sha256');
			
			for (const row of emojiCollection) {
				let str;
				
				if (row.isNewLine) {
					str = '\n';
				} else {
					str = row.path + '-' + (row.flop && 'true' || 'false');
				}
				
				hash.update(str);
			}
			
			const sha = hash.digest('hex');
			const fpath = DBot.WebRoot + '/emoji/' + sha + '.png';
			
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(DBot.URLRoot + '/emoji/' + sha + '.png');
				} else {
					let magikArgs = ['-background', 'rgba(0,0,0,0)'];
					
					let imageLayers = [];
					let currentLayer = [];
					imageLayers[0] = currentLayer;
					
					for (let i in emojiCollection) {
						if (emojiCollection[i].isNewLine) {
							currentLayer = [];
							imageLayers.push(currentLayer);
						} else {
							currentLayer.push('(', '-resize', '512x512!');
							
							if (emojiCollection[i].flop) {
								currentLayer.push('-flop');
							}
							
							currentLayer.push(emojiCollection[i].path, ')');
						}
					}
					
					for (let i in imageLayers) {
						magikArgs.push('(');
						let Layer = imageLayers[i];
						
						for (let i2 in Layer) {
							magikArgs.push(Layer[i2]);
						}
						
						magikArgs.push('+append');
						magikArgs.push(')');
					}
					
					magikArgs.push('-append', fpath);
					
					const magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code === 0) {
							msg.reply(DBot.URLRoot + '/emoji/' + sha + '.png');
						} else {
							msg.reply('<internal pony error>');
						}
						
						msg.channel.stopTyping();
					});
				}
			});
		};
		
		for (let subStr of emojiMatch) {
			subStr = subStr.toLowerCase();
			let flop = false;
			
			if (subStr.substr(0, 1) === '!') {
				flop = true;
				subStr = subStr.substr(1);
			}
			
			if (subStr.substr(0, 2) === '<:') {
				// Custom Emoji
				customEmojiAmount++;
				
				let MYID = emojiCollection.length;
				
				emojiCollection[MYID] = null;
				
				subStr.replace(customEmoji, function(matched, p1, offset, Self) {
					CommandHelper.loadImage(emojiBase + p1 + '.png', function(newPath) {
						emojiCollection[MYID] = {
							path: newPath,
							flop: flop
						};
						
						customEmojiAmount--;
						
						if (customEmojiAmount === 0)
							continueFunc();
					}, function(result) {
						msg.channel.stopTyping();
						msg.reply('Failed to download image. `HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '` URL: ' + emojiBase + p1 + '.png');
					});
				});
			} else if (subStr === '\n') {
				if (emojiCollection.length === 0)
					continue;
				
				emojiCollection.push({
					isNewLine: true
				});
			} else if (avaliableCharEmoji.includes(subStr)) {
				emojiCollection.push({
					path: './resource/emoji/' + avaliableCharEmojiMap[subStr] + '.png',
					flop: flop
				});
			} else {
				// EmojiOne handler
				
				let unicode = map[subStr];
				
				if (!unicode)
					continue;
				
				emojiCollection.push({
					path: './resource/emoji/' + unicode + '.png',
					flop: flop
				});
			}
		}
		
		if (customEmojiAmount === 0)
			continueFunc();
	}
};
