
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
const unirest = require('unirest');
const fs = DBot.fs;

Util.mkdir(DBot.WebRoot + '/jpeg', function() {
	Util.mkdir(DBot.WebRoot + '/jpeg/dlcache');
	
	for (i = 1; i <= 10; i++) {
		Util.mkdir(DBot.WebRoot + '/jpeg/' + i);
	}
});

const allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'jpeg',
	
	help_args: '<url> [quality: 1-10 = 3]',
	desc: 'Make image looks like legit JPEG',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		let quality = args[1] || '3';
		
		if (quality > 10)
			quality = 10;
		
		if (quality < 1)
			quality = 1;
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['jpeg'], 2, args);
			}
		}
		
		let hash = DBot.HashString(url);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['jpeg'], 2, args);
		
		let fPath;
		let fPathProcessed = DBot.WebRoot + '/jpeg/' + quality + '/' + hash + '.jpg';
		let fPathProcessedURL = DBot.URLRoot + '/jpeg/' + quality + '/' + hash + '.jpg';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', [fPath, '-quality', quality.toString(), fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
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
}
