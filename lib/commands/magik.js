
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

var stat = fs.statSync(DBot.WebRoot + '/magik');

if (!stat.isDirectory())
	fs.mkdirSync(DBot.WebRoot + '/magik');

fs.stat(DBot.WebRoot + '/magik/o', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/magik/o');
});

fs.stat(DBot.WebRoot + '/magik/dl', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/magik/dl');
});

var allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

var combinations = [
	'40',
	'50',
	'60',
];

module.exports = {
	name: 'magik',
	alias: ['magic'],
	
	help_args: '<url>',
	desc: 'Broken seam-carving resize ;n;',
	allowUserArgument: true,
	
	func: function(args, cmd, rawcmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		if (!url)
			return 'Invalid url maybe? ;w;';
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1];
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;';
		
		var selectedDimensions = DBot.RandomArray(combinations) + '%x' + DBot.RandomArray(combinations) + '%';
		
		var fPath = DBot.WebRoot + '/magik/dl/' + hash + '.' + ext;
		
		var newHash = DBot.HashString(url + ' ' + selectedDimensions);
		
		var fPathProcessed = DBot.WebRoot + '/magik/o/' + newHash + '.png';
		var fPathProcessedURL = DBot.URLRoot + '/magik/o/' + newHash + '.png';
		
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
					var magik = spawn('convert', [fPath, '-liquid-rescale', selectedDimensions, fPathProcessed]);
					
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
		
		fs.stat(fPath, function(err, stat) {
			if (stat && stat.isFile()) {
				ContinueFunc();
			} else {
				unirest.get(url)
				.encoding(null)
				.end(function(result) {
					var body = result.raw_body;
					
					if (!body)
						return;
					
					fs.writeFile(fPath, body, {flag: 'w'}, function(err) {
						if (err)
							return;
						
						ContinueFunc();
					});
				});
			}
		});
	}
}
