
if (true)
	return;

const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

fs.stat(DBot.WebRoot + '/dice', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/dice');
});

var allowed = [
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
	
	func: function(args, cmd, rawcmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		if (!url) {
			url = DBot.LastURLInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;';
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1];
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;';
		
		var fPath;
		
		var fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		var fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		
		var msgNew;
		var iShouldDelete = false;
		
		msg.reply(DBot.GenerateWaitMessage()).then(function(i) {
			msgNew = i;
			
			if (iShouldDelete)
				msgNew.delete(0);
		});
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					iShouldDelete = true;
					if (msgNew)
						msgNew.delete(0);
					
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/dice', '-p', '1', '-s', '32', fPath, fPathProcessed]);
					
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
		});
	}
}
