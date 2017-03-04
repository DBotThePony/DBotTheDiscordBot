
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const child_process = require('child_process');
const spawn = child_process.spawn;
const unirest = require('unirest');
const fs = require('fs');
const URL = require('url');

Util.mkdir(DBot.WebRoot + '/waw');
Util.mkdir(DBot.WebRoot + '/wave');
Util.mkdir(DBot.WebRoot + '/oil');

const combinations = [
	[150, 50, -25],
	[135, 30, -10],
	[100, 50, -15],
	[75, 25, -15],
	[35, 20, -25],
	[0, 20, 0],
	[-25, 45, 35],
	[-25, 45, 65],
	[-45, 70, 75],
	[-65, 100, 135],
	[-45, 90, 100],
	[-10, 40, 70],
	[25, 25, 50],
	[65, 10, 10],
	[100, 25, 0],
	[135, 35, -10]
];

module.exports = {
	name: 'waw',
	alias: ['wow', 'drugs', 'lcd'],
	
	allowUserArgument: true,
	delay: 10,
	
	help_args: '<url or user>',
	desc: 'Spooks',
	
	func: function(args, cmd, msg) {
		const url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'waw', args, 1);
		
		const sha = String.hash(url);
		
		let fpath;
		const fpathProcessed = DBot.WebRoot + '/waw/' + sha + '.gif';
		const fpathU = DBot.URLRoot + '/waw/' + sha + '.gif';
		
		msg.channel.startTyping();
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fpathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magikArgs = [fpath, '-resize', '256x256>'];
					
					for (let comb of combinations) {
						magikArgs.push(
							'-page', '+0+0', '(',
								'-clone', '0',
								'-colorize',
								comb[0] + ',' + comb[1] + ',' + comb[2],
							')'
						);
					}
					
					magikArgs.push(
						'-delay', '2',
						'-set', 'delay', '2',
						'-loop', '0',
						fpathProcessed
					);
					
					let magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code === 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		};
		
		DBot.LoadImageURL(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
};

DBot.RegisterCommand({
	name: 'wave',
	
	allowUserArgument: true,
	delay: 10,
	
	help_args: '<url or user>',
	desc: 'Ripple',
	
	func: function(args, cmd, msg) {
		const url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'wave', args, 1);
		
		const sha = String.hash(url);
		
		let fpath;
		const fpathProcessed = DBot.WebRoot + '/wave/' + sha + '.gif';
		const fpathU = DBot.URLRoot + '/wave/' + sha + '.gif';
		
		msg.channel.startTyping();
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fpathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magikArgs = ['-alpha', 'on', fpath, '-resize', '256x256>', '-background', 'none'];
					
					for (let amp = 0; amp < 20; amp += 5) {
						magikArgs.push(
							'(',
								'-clone', '0',
								'-wave', '-' + amp + 'x15',
							')'
						);
					}
					
					for (let amp = 20; amp >= 0; amp -= 5) {
						magikArgs.push(
							'(',
								'-clone', '0',
								'-wave', '-' + amp + 'x15',
							')'
						);
					}
					
					magikArgs.push(
						'-delete', '0',
						'-delay', '4',
						'-set', 'delay', '4',
						'-loop', '0',
						fpathProcessed
					);
					
					let magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code === 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		};
		
		DBot.LoadImageURL(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});

DBot.RegisterCommand({
	name: 'oil',
	alias: ['paint'],
	
	allowUserArgument: true,
	delay: 10,
	
	help_args: '<url or user>',
	desc: 'Paint',
	
	func: function(args, cmd, msg) {
		const url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'oil', args, 1);
		
		const sha = String.hash(url);
		
		let fpath;
		const fpathProcessed = DBot.WebRoot + '/oil/' + sha + '.gif';
		const fpathU = DBot.URLRoot + '/oil/' + sha + '.gif';
		
		msg.channel.startTyping();
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fpathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magikArgs = ['-alpha', 'on', fpath, '-resize', '256x256>', '-background', 'none'];
					
					for (let amp = 0; amp < 20; amp += 5) {
						magikArgs.push(
							'(',
								'-clone', '0',
								'-paint', amp,
							')'
						);
					}
					
					for (let amp = 20; amp >= 0; amp -= 5) {
						magikArgs.push(
							'(',
								'-clone', '0',
								'-paint', amp,
							')'
						);
					}
					
					magikArgs.push(
						'-delete', '0',
						'-delay', '4',
						'-set', 'delay', '4',
						'-loop', '0',
						fpathProcessed
					);
					
					let magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code === 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		};
		
		DBot.LoadImageURL(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});
