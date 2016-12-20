
if (true)
	return;

const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = DBot.fs;

Util.mkdir(DBot.WebRoot + '/dice');

module.exports = {
	name: 'dice',
	
	help_args: '<url>',
	desc: 'Brust an image',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		url = url || DBot.LastURLInChannel(msg.channel);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;';
		
		let hash = DBot.HashString(url);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat) {
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', ['./resource/scripts/dice', '-p', '1', '-s', '32', fPath, fPathProcessed]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
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
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}
