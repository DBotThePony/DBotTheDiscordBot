
const child_process = require('child_process');
const spawn = child_process.spawn;
const unirest = require('unirest');
const fs = require('fs');
const URL = require('url');

Util.mkdir(DBot.WebRoot + '/triggered');

const allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'triggered',
	
	argNeeded: true,
	allowUserArgument: true,
	
	help_args: '<url or user>',
	desc: '<TRIGGERED>',
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof url == 'object') {
			url = args[0].avatarURL;
			
			if (!url)
				return DBot.CommandError('User have no avatar? ;n;', 'triggered', args, 1);
		}
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'triggered', args, 1);
		
		let uObj = URL.parse(url);
		let path = uObj.pathname;
		let split = path.split('.');
		let ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return DBot.CommandError('Invalid url maybe? ;w;', 'triggered', args, 1);
		
		let sha = DBot.HashString(url);
		
		let fpath;
		let fpathProcessed = DBot.WebRoot + '/triggered/' + sha + '.png';
		let fpathU = DBot.URLRoot + '/triggered/' + sha + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fpathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magik = spawn('convert', ['(', fpath, '-resize', '512', ')', './resource/files/triggered.jpg', '-append', fpathProcessed]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code == 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	},
}

DBot.RegisterCommand({
	name: 'triggered2',
	
	argNeeded: true,
	allowUserArgument: true,
	
	help_args: '<url or user>',
	desc: '<TRIGGERED> variation 2',
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof url == 'object') {
			url = args[0].avatarURL;
			
			if (!url)
				return DBot.CommandError('User have no avatar? ;n;', 'triggered2', args, 1);
		}
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'triggered2', args, 1);
		
		let uObj = URL.parse(url);
		let path = uObj.pathname;
		let split = path.split('.');
		let ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return DBot.CommandError('Invalid url maybe? ;w;', 'triggered2', args, 1);
		
		let sha = DBot.HashString(url);
		
		let fpath;
		let fpathProcessed = DBot.WebRoot + '/triggered/' + sha + '_2.png';
		let fpathU = DBot.URLRoot + '/triggered/' + sha + '_2.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fpathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magik = spawn('convert', ['(', fpath, '-resize', '512', '-motion-blur', '0x15', ')', './resource/files/triggered.jpg', '-append', fpathProcessed]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code == 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	},
});

DBot.RegisterCommand({
	name: 'triggered3',
	
	argNeeded: true,
	allowUserArgument: true,
	
	help_args: '<url or user>',
	desc: '<TRIGGERED> variation 3',
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof url == 'object') {
			url = args[0].avatarURL;
			
			if (!url)
				return DBot.CommandError('User have no avatar? ;n;', 'triggered2', args, 1);
		}
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'triggered2', args, 1);
		
		let uObj = URL.parse(url);
		let path = uObj.pathname;
		let split = path.split('.');
		let ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return DBot.CommandError('Invalid url maybe? ;w;', 'triggered2', args, 1);
		
		let sha = DBot.HashString(url);
		
		let fpath;
		let fpathProcessed = DBot.WebRoot + '/triggered/' + sha + '_3.gif';
		let fpathU = DBot.URLRoot + '/triggered/' + sha + '_3.gif';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fpathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magik = spawn('convert', [
						'canvas:white',
						'-size', '512x680!',
						'-resize', '512x680!',
						'-draw', 'image over -60,-60 640,640 "' + fpath + '"',
						'-draw', 'image over 0,512 0,0 "./resource/files/triggered.jpg"',
						
						'(',
							'canvas:white',
							'-size', '512x680!',
							'-draw', 'image over -45,-50 640,640 "' + fpath + '"',
							'-draw', 'image over 0,512 0,0 "./resource/files/triggered.jpg"',
						')',
						
						'(',
							'canvas:white',
							'-size', '512x680!',
							'-draw', 'image over -50,-45 640,640 "' + fpath + '"',
							'-draw', 'image over 0,512 0,0 "./resource/files/triggered.jpg"',
						')',
						
						'(',
							'canvas:white',
							'-size', '512x680!',
							'-draw', 'image over -45,-65 640,640 "' + fpath + '"',
							'-draw', 'image over 0,512 0,0 "./resource/files/triggered.jpg"',
						')',
						
						'-layers', 'Optimize',
						'-set', 'delay', '2',
						fpathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code == 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	},
});
