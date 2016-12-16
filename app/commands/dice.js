
if (true)
	return;

const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
let unirest = require('unirest');
let fs = DBot.fs;

fs.stat(DBot.WebRoot + '/dice', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/dice');
});

let allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

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
		
		if (!url) {
			url = DBot.LastURLInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;';
			}
		}
		
		let hash = DBot.HashString(url);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;';
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		
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
					iShouldDelete = true;
					if (msgNew)
						msgNew.delete(0);
					
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('bash', ['./resource/scripts/dice', '-p', '1', '-s', '32', fPath, fPathProcessed]);
					
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
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}
