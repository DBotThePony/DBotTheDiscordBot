
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
const unirest = require('unirest');
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/polarblur');

const allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'polarblur',
	alias: ['heartattack'],
	
	help_args: '<url>',
	desc: 'Makes blur to the center of image',
	allowUserArgument: true,
	delay: 3,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = CommandHelper.lastImageURL(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['polarblur'], 2, args);
			}
		}
		
		let hash = String.hash(url);
		if (!CommandHelper.checkURL(url))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['polarblur'], 2, args);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/polarblur/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/polarblur/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('bash', ['./resource/scripts/polarblur', '-r', '30', '-a', '0', fPath, fPathProcessed]);
					
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
		
		CommandHelper.loadImage(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}
