
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
const unirest = require('unirest');
const fs = DBot.fs;

Util.mkdir(DBot.WebRoot + '/vignette');

let allowed = [
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
		let url = DBot.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'vignette', args, 1);
		
		let hash = DBot.HashString(url);
		
		msg.channel.startTyping();
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/vignette/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/vignette/' + hash + '.png';
		
		let msgNew;
		let iShouldDelete = false;
		
		msg.oldReply(DBot.GenerateWaitMessage()).then(function(i) {
			msgNew = i;
			
			if (iShouldDelete)
				msgNew.delete(0);
		});
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					iShouldDelete = true;
					if (msgNew)
						msgNew.delete(0);
					
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('bash', ['./resource/scripts/vignette', '-i', '50', '-o', '150', '-c', 'black', '-a', '100', fPath, fPathProcessed]);
					
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
