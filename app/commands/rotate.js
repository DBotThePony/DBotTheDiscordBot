
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = DBot.fs;

Util.mkdir(DBot.WebRoot + '/rotate')

module.exports = {
	name: 'rotate',
	
	help_args: '[-]<degrees> <image>',
	desc: 'Rotates image by specified degree\nDegree is automatically normalizated to -180 --- 180 interval',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let degree = Util.ToNumber(args[0]);
		
		if (!degree)
			return DBot.CommandError('No degree specified ;N;', 'rotate', args, 1);
		
		degree = degree % 360;
		
		if (degree > 180)
			degree = degree - 360;
		else if (degree < -180)
			degree = degree + 360;
		
		// Inversing
		degree = -degree;
		
		let url = args[1];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		url = url || DBot.LastURLImageInChannel2(msg.channel);
		if (!DBot.CheckURLImage2(url))
			return DBot.CommandError('Invalid url maybe? ;w;', 'rotate', args, 2);
		
		let hash = DBot.HashString(url + '___' + degree);
		
		let fPath;
		let fPathProcessed;
		let fPathProcessedURL;
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', [fPath, '-background', 'none', '-rotate', degree, fPathProcessed]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath, newExt) {
			fPathProcessed = DBot.WebRoot + '/rotate/' + hash + '.' + newExt;
			fPathProcessedURL = DBot.URLRoot + '/rotate/' + hash + '.' + newExt;
			
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}

DBot.RegisterCommand({
	name: 'grotate',
	
	help_args: '<image>',
	desc: 'DO A BARRELL ROLL',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		url = url || DBot.LastURLImageInChannel(msg.channel);
		if (!DBot.CheckURLImage(url))
			return DBot.CommandError('Invalid url maybe? ;w;', 'grotate', args, 1);
		
		let hash = DBot.HashString(url);
		
		let fPath;
		let fPathProcessed = DBot.WebRoot + '/rotate/' + hash + '.gif';
		let fPathProcessedURL = DBot.URLRoot + '/rotate/' + hash + '.gif';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magikArgs = ['-alpha', 'on', '(', fPath, '-scale', '256x256>', '-scale', '256x256<', ')', '(', '-size', '256x256', 'xc:none', '-fill', 'white', '-draw', 'circle 128,128 128,0', ')', '-compose', 'copyopacity', '-background', 'white'];
					
					for (let i = 0; i <= 340; i += 20) {
						magikArgs.push('(', '-clone', '0', '-rotate', i, '-crop', '256x256+0+0!', '-clone', '1', '-composite', ')');
					}
					
					magikArgs.push('-compose', 'srcover', '-delete', '0', '-delete', '0', '-delay', '5', '-set', 'delay', '5', '-set', 'dispose', 'None', fPathProcessed);
					let magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('*DED*');
						}
						
						msg.channel.stopTyping();
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath, newExt) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});
