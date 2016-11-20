
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

fs.stat(DBot.WebRoot + '/invaded', function(err, stat) {
	if (!stat)
		fs.mkdir(DBot.WebRoot + '/invaded');
});

var allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'invaded',
	alias: ['invade'],
	
	help_args: '<user>',
	desc: 'INVASION',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, rawcmd, msg) {
		if (typeof(args[0]) != 'object')
			return 'Must be an user ;n;';
		
		var url = args[0].avatarURL;
		
		if (!url) {
			return 'User have no avatar? ;w;';
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1];
		
		var fPath;
		
		var fPathProcessed = DBot.WebRoot + '/invaded/' + hash + '.png';
		var fPathProcessedURL = DBot.URLRoot + '/invaded/' + hash + '.png';
		
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
					var magik = spawn('convert', [
						fPath,
						'-resize', '512',
						'-recolor', '.3 .1 .3 .3 .1 .3 .3 .1 .3',
						'-draw', 'rectangle 0, 400, 512, 480',
						'-fill', 'black',
						'-gravity', 'South',
						'-fill', 'white',
						'-weight', 'Bold',
						'-pointsize', '24',
						'-draw', 'text 0,95 "' + args[0].username + ' has invaded!"',
						fPathProcessed
					]);
					
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
