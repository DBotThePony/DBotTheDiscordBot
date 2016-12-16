
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

fs.stat(DBot.WebRoot + '/vignette', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/vignette');
});

var allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'vignette',
	
	help_args: '<url>',
	desc: 'Adds a vignette effect to image',
	allowUserArgument: true,
	delay: 3,
	
	func: function(args, cmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['vignette'], 2, args);
			}
		}
		
		var hash = DBot.HashString(url);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['vignette'], 2, args);
		
		msg.channel.startTyping();
		
		var fPath;
		
		var fPathProcessed = DBot.WebRoot + '/vignette/' + hash + '.png';
		var fPathProcessedURL = DBot.URLRoot + '/vignette/' + hash + '.png';
		
		var msgNew;
		var iShouldDelete = false;
		
		msg.oldReply(DBot.GenerateWaitMessage()).then(function(i) {
			msgNew = i;
			
			if (iShouldDelete)
				msgNew.delete(0);
		});
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					iShouldDelete = true;
					if (msgNew)
						msgNew.delete(0);
					
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/scripts/vignette', '-i', '50', '-o', '150', '-c', 'black', '-a', '100', fPath, fPathProcessed]);
					
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
						iShouldDelete = true;
						if (msgNew)
							msgNew.delete(0);
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			
			iShouldDelete = true;
			if (msgNew)
				msgNew.delete(0);
			
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}
