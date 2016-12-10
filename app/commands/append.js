
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
const unirest = require('unirest');
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/append');

var allowedExts = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

let fn = function(arg, i) {
	return function(args, cmd, msg) {
		var urlBuild = [];
		
		for (let arg of args) {
			let url;
			
			if (typeof arg == 'object') {
				url = arg.avatarURL;
				
				if (!url) {
					msg.reply('User have no avatar :<' + Util.HighlightHelp([arg], Number(i) + 2, args));
					return;
				}
			} else {
				url = arg;
			}
			
			let uObj = URL.parse(url);
			let path = uObj.pathname;
			let split = path.split('.');
			let ext = split[split.length - 1].toLowerCase();
			
			if (!Util.HasValue(allowedExts, ext)) {
				msg.reply('One of arguments is invalid :<' + Util.HighlightHelp([arg], Number(i) + 2, args));
				return;
			}
			
			urlBuild.push(url);
		}
		
		if (urlBuild.length < 2)
			return 'Must specify at least two images';
		
		var sha = DBot.HashString(urlBuild.join(' '));
		var fpath = DBot.WebRoot + '/append/' + sha + '_' + i + '.png';
		var fpathU = DBot.URLRoot + '/append/' + sha + '_' + i + '.png';
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(fpathU);
			} else {
				var urlStrings = [];
				var left = urlBuild.length;
				
				var continueFunc = function() {
					var magikArgs = [];
					
					for (let ur of urlStrings) {
						magikArgs.push(ur);
					}
					
					magikArgs.push(arg, fpath);
					
					var magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('<internal pony error>');
						}
						
						msg.channel.stopTyping();
					});
				}
				
				for (let i in urlBuild) {
					DBot.LoadImageURL(urlBuild[i], function(newPath) {
						left--;
						urlStrings[i] = newPath;
						
						if (left == 0) {
							continueFunc();
						}
					}, function(result) {
						msg.channel.stopTyping();
						msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '" URL: ' + urlStrings[i]);
					});
				}
			}
		});
	};
}

module.exports = {
	name: 'append',
	alias: ['+append'],
	
	help_args: '<image1> <image2> ...',
	desc: 'Appends images at horisontal',
	allowUserArgument: true,
	
	func: fn('+append', 1),
}

DBot.RegisterCommand({
	name: 'vappend',
	alias: ['-append'],
	
	help_args: '<image1> <image2> ...',
	desc: 'Appends images at vertical',
	allowUserArgument: true,
	
	func: fn('-append', 2),
});
