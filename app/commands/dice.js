
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = DBot.fs;

Util.mkdir(DBot.WebRoot + '/dice');
Util.mkdir(DBot.WebRoot + '/multi');

module.exports = {
	name: 'dice',
	
	help_args: '<url>',
	desc: 'Brust an image',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		url = url || DBot.LastURLInChannel(msg.channel);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;';
		
		let hash = DBot.HashString(CurTime() + '_' + msg.channel.id);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		let tmpFileDice = DBot.WebRoot + '/dice/' + hash + '_tmp_dice.miff';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			IMagick.Identify(fPath, function(err, ftype, width, height) {
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				let size = Math.min(Math.ceil(width * .1), Math.ceil(height * .1));
				
				let fragmentsW = Math.ceil(width / size);
				let fragmentsH = Math.ceil(height / size);
				let total = fragmentsW * fragmentsH;
				
				let magik = spawn('convert', ['-quiet', fPath, '-crop', size + 'x' + size, tmpFileDice]);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code != 0) {
						msg.channel.stopTyping();
						msg.reply('*falls on the ground and squeaks*');
						return;
					}
					
					let magikArgs = ['-background', 'none', '-tile', fragmentsW + 'x' + fragmentsH, '-geometry', '+0+0'];
					
					for (let i = 0; i < total; i++) {
						let rand = Util.Random(-2, 2);
						magikArgs.push('(', tmpFileDice + '[' + i + ']', '-rotate', rand * 90, ')')
					}
					
					magikArgs.push(fPathProcessed);
					let magik = spawn('montage', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						if (code != 0) {
							msg.reply('*falls on the ground and squeaks*');
							return;
						}
						
						msg.reply(fPathProcessedURL);
						fs.unlink(tmpFileDice, function(err) {
							if (err)
								console.error(err);
						});
					});
				});
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}

DBot.RegisterCommand({
	name: 'scramble',
	
	help_args: '<url>',
	desc: 'Similar to dice, but scrambles parts',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		url = url || DBot.LastURLInChannel(msg.channel);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;';
		
		let hash = DBot.HashString(CurTime() + '_2_' + msg.channel.id);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		let tmpFileDice = DBot.WebRoot + '/dice/' + hash + '_tmp_dice.miff';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			IMagick.Identify(fPath, function(err, ftype, width, height) {
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				let size = Math.min(Math.ceil(width * .1), Math.ceil(height * .1));
				
				let fragmentsW = Math.ceil(width / size);
				let fragmentsH = Math.ceil(height / size);
				let total = fragmentsW * fragmentsH;
				let left = [];
				
				for (let i = 0; i < total; i++)
					left.push(i);
				
				let magik = spawn('convert', ['-quiet', fPath, '-crop', size + 'x' + size, tmpFileDice]);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code != 0) {
						msg.channel.stopTyping();
						msg.reply('*falls on the ground and squeaks*');
						return;
					}
					
					let magikArgs = ['-background', 'none', '-tile', fragmentsW + 'x' + fragmentsH, '-geometry', '+0+0'];
					
					for (let i = 0; i < total; i++) {
						let r = Util.Random(0, left.length - 1);
						let slice = left[r];
						left.splice(r, 1);
						
						let rand = Util.Random(-2, 2);
						magikArgs.push('(', tmpFileDice + '[' + slice + ']', '-rotate', rand * 90, ')')
					}
					
					magikArgs.push(fPathProcessed);
					let magik = spawn('montage', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						if (code != 0) {
							msg.reply('*falls on the ground and squeaks*');
							return;
						}
						
						msg.reply(fPathProcessedURL);
						fs.unlink(tmpFileDice, function(err) {
							if (err)
								console.error(err);
						});
					});
				});
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});

DBot.RegisterCommand({
	name: 'scramble2',
	
	help_args: '<url>',
	desc: 'Similar to dice, but scrambles parts without rotating them',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		url = url || DBot.LastURLInChannel(msg.channel);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;';
		
		let hash = DBot.HashString(CurTime() + '_2_' + msg.channel.id);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		let tmpFileDice = DBot.WebRoot + '/dice/' + hash + '_tmp_dice.miff';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			IMagick.Identify(fPath, function(err, ftype, width, height) {
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				let size = Math.min(Math.ceil(width * .1), Math.ceil(height * .1));
				
				let fragmentsW = Math.ceil(width / size);
				let fragmentsH = Math.ceil(height / size);
				let total = fragmentsW * fragmentsH;
				let left = [];
				
				for (let i = 0; i < total; i++)
					left.push(i);
				
				let magik = spawn('convert', ['-quiet', fPath, '-crop', size + 'x' + size, tmpFileDice]);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code != 0) {
						msg.channel.stopTyping();
						msg.reply('*falls on the ground and squeaks*');
						return;
					}
					
					let magikArgs = ['-background', 'none', '-tile', fragmentsW + 'x' + fragmentsH, '-geometry', '+0+0'];
					
					for (let i = 0; i < total; i++) {
						let r = Util.Random(0, left.length - 1);
						let slice = left[r];
						left.splice(r, 1);
						
						magikArgs.push(tmpFileDice + '[' + slice + ']')
					}
					
					magikArgs.push(fPathProcessed);
					let magik = spawn('montage', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						if (code != 0) {
							msg.reply('*falls on the ground and squeaks*');
							return;
						}
						
						msg.reply(fPathProcessedURL);
						fs.unlink(tmpFileDice, function(err) {
							if (err)
								console.error(err);
						});
					});
				});
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});

DBot.RegisterCommand({
	name: 'multi',
	alias: ['multiply', 'multilayer', 'theyareeverywhere'],
	
	help_args: '<url>',
	desc: 'Rotate image much times',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		url = url || DBot.LastURLInChannel(msg.channel);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;';
		
		let hash = DBot.HashString(CurTime() + '_' + msg.channel.id);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/multi/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/multi/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			IMagick.Identify(fPath, function(err, ftype, width, height) {
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				let size = Math.min(Math.ceil(width * .1), Math.ceil(height * .1));
				
				let fragmentsW = Math.ceil(width / size);
				let fragmentsH = Math.ceil(height / size);
				let total = fragmentsW * fragmentsH;
				let left = [];
				
				for (let i = 0; i < total; i++)
					left.push(i);
				
				let magikArgs = ['-background', 'none', '-tile', fragmentsW + 'x' + fragmentsH, '-geometry', '+0+0', '(', fPath, '-resize', '500x500>', ')'];
				
				for (let i = 0; i < total; i++) {
					let r = Util.Random(0, left.length - 1);
					let slice = left[r];
					left.splice(r, 1);
					
					let rand = Util.Random(-2, 2);
					magikArgs.push('(', '-clone', '0', '-rotate', rand * 90, ')')
				}
				
				magikArgs.push('-delete', '0', fPathProcessed);
				let magik = spawn('montage', magikArgs);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					msg.channel.stopTyping();
					
					if (code != 0) {
						msg.reply('*falls on the ground and squeaks*');
						return;
					}
					
					msg.reply(fPathProcessedURL);
				});
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});
