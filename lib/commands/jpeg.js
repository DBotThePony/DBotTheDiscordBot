
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

var stat = fs.statSync(DBot.WebRoot + '/jpeg');

if (!stat.isDirectory())
	fs.mkdirSync(DBot.WebRoot + '/jpeg');

for (i = 1; i <= 10; i++) {
	fs.stat(DBot.WebRoot + '/jpeg/' + i, function(err, stat) {
		if (!stat.isDirectory())
			fs.mkdir(DBot.WebRoot + '/jpeg/' + i);
	});
}

var stat = fs.statSync(DBot.WebRoot + '/jpeg/dlcache');

if (!stat.isDirectory())
	fs.mkdirSync(DBot.WebRoot + '/jpeg/dlcache');

var allowed = [
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
	
	func: function(args, cmd, rawcmd, msg) {
		var url = args[0];
		var quality = args[1] || '3';
		
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
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['jpeg'], 2, args);
		
		
		var fPath;
		var fPathProcessed = DBot.WebRoot + '/jpeg/' + quality + '/' + hash + '.jpg';
		var fPathProcessedURL = DBot.URLRoot + '/jpeg/' + quality + '/' + hash + '.jpg';
		
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
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('convert', [fPath, '-quality', quality.toString(), fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.on('close', function(code) {
						iShouldDelete = true;
						if (msgNew)
							msgNew.delete(0);
						
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
		});
	}
}
