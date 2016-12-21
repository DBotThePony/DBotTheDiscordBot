
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = DBot.fs;

Util.mkdir(DBot.WebRoot + '/glitch');

module.exports = {
	name: 'glitch',
	
	help_args: '<url>',
	desc: 'Glitches the image',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		url = url || DBot.LastURLImageInChannel(msg.channel);
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'glitch', args, 1);
		
		if (!DBot.CheckURLImage(url))
			return DBot.CommandError('Invalid url maybe? ;w;', 'glitch', args, 1);
		
		let hash = DBot.HashString(url);
		
		let fPath;
		let fPathProcessed = DBot.WebRoot + '/glitch/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/glitch/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', [
						'(', fPath, '-resize', '1024x1024>', ')', '-alpha', 'on', '(', '-clone', '0', '-channel', 'RGB', '-separate', '-channel', 'A', '-fx', '0', '-compose', 'CopyOpacity', '-composite', ')', '(', '-clone', '0', '-roll', '+5', '-channel', 'R', '-fx', '0', '-channel', 'A', '-evaluate', 'multiply', '.5', ')', '(', '-clone', '0', '-roll', '-5', '-channel', 'G', '-fx', '0', '-channel', 'A', '-evaluate', 'multiply', '.5', ')', '(', '-clone', '0', '-roll', '+0+5', '-channel', 'B', '-fx', '0', '-channel', 'A', '-evaluate', 'multiply', '.5', ')', '(', '-clone', '0', '-channel', 'A', '-fx', '0', ')', '-delete', '0', '-background', 'none', '-compose', 'SrcOver', '-layers', 'merge', '-rotate', '90', '-wave', '1x5', '-rotate', '-90', fPathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						msg.reply(fPathProcessedURL);
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
