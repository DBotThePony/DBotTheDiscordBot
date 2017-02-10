
/* global DBot, Util, IMagick */

const child_process = DBot.js.child_process;
const spawn = child_process.spawn;
const fs = DBot.js.filesystem;

Util.mkdir(DBot.WebRoot + '/wall');

module.exports = {
	name: 'wall',
	alias: ['iwall', 'flatspace'],
	
	help_args: '<url>',
	desc: 'Creates a small flat space out of image',
	allowUserArgument: true,
	delay: 10,
	
	func: function(args, cmd, msg) {
		let url = DBot.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'wall', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		
		const fPathProcessed = DBot.WebRoot + '/wall/' + hash + '.png';
		const fPathProcessedURL = DBot.URLRoot + '/wall/' + hash + '.png';
		
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
						'(',
							'-size', '128x128',
							'xc:black',
							'(', fPath,
							'-resize', '128', ')',
							'-compose', 'srcover',
							'-composite',
						')',
						'-virtual-pixel', 'tile',
						'-mattecolor', 'none',
						'-background', 'none',
						'-resize', '512x512!',
						'-distort', 'Perspective', '0,0,57,42  0,128,63,130  128,0,140,60  128,128,140,140',
						fPathProcessed
					]);

					Util.Redirect(magik);

					magik.on('close', function(code) {
						if (code === 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
							msg.reply('Jump. Jump, Jump... *falls on the ground*');
						}
					});
				}
			});
		};
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
};
