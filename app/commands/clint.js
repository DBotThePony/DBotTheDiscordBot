
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
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', [
						'-alpha', 'on',
						'(',
							'-size', '1324x1068', 'xc:black',
							'-gravity', 'center',
							'(', fPath, '-scale', '1024x768', ')',
							'-compose', 'srcover', '-composite',
							'(', '-size', '1200x800!', 'xc:black', ')',
							'-gravity', 'center', '+swap', '-composite',
							'-mattecolor', 'none', '-virtual-pixel', 'none',
							'-distort', 'perspective', '86,16,786,177 1111,16,1090,30 86,784,790,503 1111,784,1140,690',
						')',
						'./resource/files/clint.png', '-gravity', 'northwest',
						'-compose', 'srcover', '-composite',
						'-crop', '1200x675', '+delete', fPathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (msg.checkAbort()) return;
						
						if (code === 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
					});
				}
			});
		};
		
		CommandHelper.loadImage(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
};
