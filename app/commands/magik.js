
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

fs.stat(DBot.WebRoot + '/magik', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/magik');
});

var allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

var combinations = [
	['40', '160'],
	['50', '150'],
	['60', '140'],
];

module.exports = {
	name: 'magik',
	alias: ['magic'],
	
	help_args: '<url>',
	desc: 'Broken seam-carving resize ;n;',
	allowUserArgument: true,
	delay: 5,
	
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
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['magik'], 2, args);
			}
		}
		
		let hash = DBot.HashString(url);
		let uObj = URL.parse(url);
		let path = uObj.pathname;
		let split = path.split('.');
		let ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['magik'], 2, args);
		
		let comb1 = DBot.RandomArray(combinations);
		let comb2 = DBot.RandomArray(combinations);
		
		let selectedDimensions = comb1[0] + '%x' + comb2[0] + '%';
		let selectedDimensions2 = comb1[1] + '%x' + comb2[1] + '%';
		
		let fPath;
		
		let newHash = DBot.HashString(url + ' ' + selectedDimensions);
		
		let fPathProcessed = DBot.WebRoot + '/magik/' + newHash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/magik/' + newHash + '.png';
		
		msg.channel.startTyping();
		
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
					let magik = spawn('convert', ['(', '(', fPath, '-resize', '2000x2000>', ')', '-liquid-rescale', selectedDimensions, ')', '-resize', selectedDimensions2, fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.on('close', function(code) {
						iShouldDelete = true;
						if (msgNew)
							msgNew.delete(0);
						
						if (code == 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
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
			iShouldDelete = true;
			if (msgNew)
				msgNew.delete(0);
			
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}
