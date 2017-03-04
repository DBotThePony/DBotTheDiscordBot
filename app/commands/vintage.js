
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
let unirest = require('unirest');
let fs = require('fs');

Util.mkdir(DBot.WebRoot + '/vintage');
Util.mkdir(DBot.WebRoot + '/vintage2');
Util.mkdir(DBot.WebRoot + '/vintage3');

let allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'vintage',
	alias: ['retro'],
	
	help_args: '<url>',
	desc: 'Makes an image looks vintage',
	allowUserArgument: true,
	delay: 3,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'vintage', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/vintage/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/vintage/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('bash', ['./resource/scripts/vintage1', fPath, fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}

DBot.RegisterCommand({
	name: 'vintage2',
	
	help_args: '<url>',
	desc: 'Makes an image looks vintage (Second variant)',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'vintage2', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/vintage2/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/vintage2/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('bash', ['./resource/scripts/vintage2', fPath, fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});

DBot.RegisterCommand({
	name: 'vintage3',
	
	help_args: '<url>',
	desc: 'Makes an image looks vintage (Third variant)',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		if (!url) {
			url = CommandHelper.lastURL(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['vintage3'], 2, args);
			}
		}
		
		let hash = String.hash(url);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['vintage3'], 2, args);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/vintage3/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/vintage3/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('bash', ['./resource/scripts/vintage3', fPath, fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});
