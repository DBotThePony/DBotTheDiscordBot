
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/im_composite');

const allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'metalic',
	alias: ['bmetalic', 'bmetallic', 'metallic'],
	
	help_args: '<url>',
	desc: 'Blends an image with metal texture\nUses "bumpmap" filter',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let url = DBot.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'metalic', args, 1);
		
		let sha = DBot.HashString(url);
		
		let fInput;
		
		let fpath = DBot.WebRoot + '/im_composite/' + sha + '.png';
		let fpathURL = DBot.URLRoot + '/im_composite/' + sha + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathURL);
				} else {
					let magik = spawn('composite', ['(', '(', fInput, '-resize', '667x667>', ')', '-resize', '667x667<', ')', './resource/files/metal.png', '-compose', 'bumpmap', '-gravity', 'center', fpath]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fpathURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fInput = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}

DBot.RegisterCommand({
	name: 'cmetalic',
	alias: ['cmetallic'],
	
	help_args: '<url>',
	desc: 'Blends an image with metal texture\nUses "color-burn" filter',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let url = DBot.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'metalic', args, 1);
		
		let sha = DBot.HashString(url);
		
		let fInput;
		
		let fpath = DBot.WebRoot + '/im_composite/' + sha + '_c.png';
		let fpathURL = DBot.URLRoot + '/im_composite/' + sha + '_c.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathURL);
				} else {
					let magik = spawn('composite', ['(', '(', fInput, '-resize', '667x667>', ')', '-resize', '667x667<', ')', './resource/files/metal.png', '-compose', 'color-burn', '-gravity', 'center', fpath]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fpathURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fInput = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});
