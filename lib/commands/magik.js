
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
		
		var comb1 = DBot.RandomArray(combinations);
		var comb2 = DBot.RandomArray(combinations);
		
		var selectedDimensions = comb1[0] + '%x' + comb2[0] + '%';
		var selectedDimensions2 = comb1[1] + '%x' + comb2[1] + '%';
		
		var fPath;
		
		var newHash = DBot.HashString(url + ' ' + selectedDimensions);
		
		var fPathProcessedTmp = DBot.WebRoot + '/magik/' + newHash + '_tmp.png';
		var fPathProcessed = DBot.WebRoot + '/magik/' + newHash + '.png';
		var fPathProcessedURL = DBot.URLRoot + '/magik/' + newHash + '.png';
		
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
					var magik = spawn('convert', [fPath, '-liquid-rescale', selectedDimensions, fPathProcessedTmp]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							var magik = spawn('convert', [fPathProcessedTmp, '-resize', selectedDimensions2, fPathProcessed]);
							
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
						} else {
							iShouldDelete = true;
							if (msgNew)
								msgNew.delete(0);
							
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
