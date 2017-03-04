
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
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/clint');

module.exports = {
	name: 'clint',
	
	help_args: '<url>',
	desc: 'Monitor',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'clint', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/clint/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/clint/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', ['-alpha', 'on', '(', '-size', '1024x768', 'xc:black', '-gravity', 'center', '(', fPath, '-resize', '1024x768>', '-resize', '1024x768<', ')', '-compose', 'srcover', '-composite', '(', '-size', '1200x800!', 'xc:none', ')', '-gravity', 'northwest', '+swap', '-composite', '-mattecolor', 'none', '-virtual-pixel', 'none', '-distort', 'perspective', '0,0,788,181 1024,0,1080,49 0,768,809,493 1024,768,1109,649', '-distort', 'shepards', '798,350 780,350 750,181 755,181 750,170 730,170 750,200 740,200 875,134 875,120 850,134 850,120 889,134 889,120 909,548 909,580 1095,290 1105,290 1095,320 1105,320 1095,340 1105,340 1095,362 1105,362', ')', './resource/files/clint.png', '+swap', '-gravity', 'northwest', '-compose', 'srcover', '-composite', fPathProcessed]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (msg.checkAbort()) return;
						if (code == 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
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
}
