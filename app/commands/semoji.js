

// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const fs = require('fs');
const unirest = require('unirest');
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
		
		if (args.length > 5)
			return 'Fokk you, too many of them!';
		
		let STOP = false;
		
		msg.channel.startTyping();
		
		for (let arg of args) {
			let str = arg.replace(toReplace, '');
			
			Postgres.query('SELECT EMOJI FROM steam_emoji_fail WHERE EMOJI = ' + Postgres.escape(str), function(err, data) {
				if (STOP)
					return;
				
				if (data[0] && data[0].EMOJI) {
					msg.channel.stopTyping();
					msg.reply('Invalid emoji: ' + str);
				} else {
					let fpath = DBot.WebRoot + '/steam_emoji/' + str + '.png';
					
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
									Postgres.query('INSERT INTO steam_emoji_fail VALUES (' + Postgres.escape(str) + ')');
									msg.channel.stopTyping();
								} else {
									fs.writeFile(fpath, result.raw_body, function(err) {
										msg.channel.sendFile(result.raw_body, str + '.png')
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
		
		if (args.length > 5)
			return 'Fokk you, too many of them!';
		
		let STOP = false;
		
		msg.channel.startTyping();
		
		for (let arg of args) {
			let str = arg.replace(toReplace, '');
			
			Postgres.query('SELECT EMOJI FROM steam_emoji_fail WHERE EMOJI = ' + Postgres.escape(str), function(err, data) {
				if (STOP)
					return;
				
				if (data[0] && data[0].EMOJI) {
					msg.channel.stopTyping();
					msg.reply('Invalid emoji: ' + str);
				} else {
					let fpath = DBot.WebRoot + '/steam_emoji_large/' + str + '.png';
					
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
									Postgres.query('INSERT INTO steam_emoji_fail VALUES (' + Postgres.escape(str) + ')');
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
								}
							});
						}
					});
				}
			});
		}
	}
});
