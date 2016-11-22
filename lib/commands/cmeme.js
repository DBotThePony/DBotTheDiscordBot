
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

fs.stat(DBot.WebRoot + '/cmeme', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/cmeme');
});

var allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'cmeme',
	alias: ['bmeme', 'meme'],
	
	help_args: '<url> <top test> [bottom test]',
	desc: 'Tries to parody meme generator. URL can be user with valid avatar. If you want top text with spaces,\nyou should put test in single or double quotes.\nThere is no need to put bottom text in quotes, all arguments are concated into one bottom string.',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, rawcmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;';
			}
		}
		
		var topText = args[1];
		
		if (!topText)
			return 'You must say me the text to place on top';
		
		var bottomText;
		
		for (i = 2; i < args.length; i++) {
			if (bottomText)
				bottomText += ' ' + args[i];
			else
				bottomText = args[i];
		}
		
		var hash = DBot.HashString(url + topText + (bottomText || ''));
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1];
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;';
		
		var fPath;
		
		var fPathProcessed = DBot.WebRoot + '/cmeme/' + hash + '.png';
		var fPathProcessedURL = DBot.URLRoot + '/cmeme/' + hash + '.png';
		
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
					var magik = spawn('identify', [fPath]);
					
					var output = '';
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						output += data.toString();
						// console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0 && output != '') {
							var parse = output.split(' ');
							
							var fileName = parse[0];
							var fileType = parse[1];
							var fileSizes = parse[2];
							
							var fileSizesS = fileSizes.split('x');
							var width = Number(fileSizesS[0]);
							var height = Number(fileSizesS[1]);
							var aspectRatio = height / width;
							var aspectRatio2 = width / height;
							
							var args = [fPath];
							
							if (width < 256) {
								args.push('-resize');
								
								width = 256;
								height = Math.floor(aspectRatio * 256);
								
								args.push('256x' + height);
							}
							
							if (height < 256) {
								args.push('-resize');
								
								height = 256;
								width = Math.floor(aspectRatio2 * 256);
								
								args.push(width);
							}
							
							if (width > 1500 || height > 1500)
								msg.reply('Big Picture OwO, Cropping to 1500x1500');
							
							if (width > 1500) {
								args.push('-resize');
								
								width = 1500;
								height = Math.floor(aspectRatio * 1500);
								
								args.push('1500x' + height);
							}
							
							if (height > 1500) {
								args.push('-resize');
								
								height = 1500;
								width = Math.floor(aspectRatio2 * 1500);
								
								args.push(width);
							}
							
							height = Math.floor(height);
							width = Math.floor(width);
							
							args.push('-gravity');
							args.push('South');
							args.push('-font');
							args.push('Impact');
							args.push('-fill');
							args.push('white');
							args.push('-stroke');
							args.push('black');
							args.push('-strokewidth');
							args.push('2');
							args.push('-weight');
							args.push('500');
							
							args.push('-pointsize');
							
							var calc = Math.floor(Math.sqrt(((width - 20) / topText.length) * 40));
							
							if (calc > 170) {
								calc = 170;
							} else if (calc < 18) {
								calc = 18;
							}
							
							args.push(String(calc));
							
							args.push('-draw');
							args.push('text 0,' + (height - calc * 1.3) + ' "' + topText + '"');
							
							if (bottomText) {
								args.push('-pointsize');
								
								var calc = Math.floor(Math.sqrt(((width - 20) / bottomText.length) * 40));
								
								if (calc > 170) {
									calc = 170;
								} else if (calc < 18) {
									calc = 18;
								}
								
								args.push(String(calc));
								
								args.push('-draw');
								args.push('text 0,' + (calc * 0.2) + ' "' + bottomText + '"');
							}
							
							args.push(fPathProcessed);
							
							var magik = spawn('convert', args);
							
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
									msg.reply('<internal pony error>');
								}
								
								iShouldDelete = true;
								if (msgNew)
									msgNew.delete(0);
							});
						} else {
							msg.reply('<internal pony error>');
							iShouldDelete = true;
							if (msgNew)
								msgNew.delete(0);
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
