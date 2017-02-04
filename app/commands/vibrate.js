
/* global DBot, Util */

const child_process = DBot.js.child_process;
const spawn = child_process.spawn;
const fs = DBot.js.fs;

Util.mkdir(DBot.WebRoot + '/vibrate');

module.exports = {
	name: 'vibrate',
	alias: ['vibrating'],
	
	allowUserArgument: true,
	
	help_args: '<url>',
	desc: '<vibrating ponies>',
	
	func: function(args, cmd, msg) {
		const url = DBot.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'vibrate', args, 1);
		
		const sha = DBot.HashString(url);
		
		let fpath;
		const fpathProcessed = DBot.WebRoot + '/vibrate/' + sha + '.gif';
		const fpathProcessedPrepare = DBot.WebRoot + '/vibrate/' + sha + '_pre.png';
		const fpathU = DBot.URLRoot + '/vibrate/' + sha + '.gif';
		
		msg.channel.startTyping();
		
		const ContinueFunc2 = function() {
			fs.stat(fpathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magik = spawn('convert', [
						'-size', '512x620!',
						'canvas:white',
						'-resize', '512x620!',
						'-draw', 'image srcover -60,-60 0,0 "' + fpathProcessedPrepare + '"',
						
						'(',
							'canvas:white',
							'-size', '512x620!',
							'-draw', 'image srcover -45,-50 0,0 "' + fpathProcessedPrepare + '"',
							
						')',
						
						'(',
							'canvas:white',
							'-size', '512x620!',
							'-draw', 'image srcover -50,-45 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'(',
							'canvas:white',
							'-size', '512x620!',
							'-draw', 'image srcover -45,-65 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'-set', 'delay', '2',
						fpathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						fs.unlink(fpathProcessedPrepare);
						
						if (code === 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		};
		
		const ContinueFunc = function() {
			fs.stat(fpathProcessedPrepare, function(err, stat) {
				if (stat) {
					ContinueFunc2();
				} else {
					let magik = spawn('convert', [fpath, '-resize', '640', fpathProcessedPrepare]);
					
					magik.stdout.pipe(process.stdout);
					magik.stderr.pipe(process.stdout);
					
					magik.on('close', function(code) {
						if (code === 0) {
							ContinueFunc2();
						} else {
							msg.reply('I am cracked up ;w;');
							msg.channel.stopTyping();
						}
					});
				}
			});
		};
		
		DBot.LoadImageURL(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
};

DBot.RegisterCommand({
	name: 'shake',
	alias: ['shaking'],
	
	allowUserArgument: true,
	
	help_args: '<url>',
	desc: '<shaking ponies>',
	delay: 4,
	
	func: function(args, cmd, msg) {
		const url = DBot.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'vibrate', args, 1);
		
		const sha = DBot.HashString(url);
		
		let fpath;
		const fpathProcessed = DBot.WebRoot + '/vibrate/' + sha + '_shake.gif';
		const fpathProcessedPrepare = DBot.WebRoot + '/vibrate/' + sha + '_pre_shake.png';
		const fpathU = DBot.URLRoot + '/vibrate/' + sha + '_shake.gif';
		
		msg.channel.startTyping();
		
		const ContinueFunc2 = function() {
			fs.stat(fpathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magik = spawn('convert', [
						'-size', '512x520!',
						'canvas:white',
						'-resize', '512x580!',
						'-draw', 'image srcover -60,-60 0,0 "' + fpathProcessedPrepare + '"',
						
						'(',
							'-size', '512x580',
							'canvas:white',
							'-draw', 'image srcover -30,-50 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'(',
							'-size', '512x580',
							'canvas:white',
							'-draw', 'image srcover -50,-35 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'(',
							'-size', '512x580',
							'canvas:white',
							'-draw', 'image srcover -35,-70 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'(',
							'-size', '512x580',
							'canvas:white',
							'-draw', 'image srcover -70,-60 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'(',
							'-size', '512x580',
							'canvas:white',
							'-draw', 'image srcover -30,-70 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'(',
							'-size', '512x580',
							'canvas:white',
							'-draw', 'image srcover -50,-60 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'(',
							'-size', '512x580',
							'canvas:white',
							'-draw', 'image srcover -10,-30 0,0 "' + fpathProcessedPrepare + '"',
						')',
						
						'-set', 'delay', '3',
						fpathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						fs.unlink(fpathProcessedPrepare);
						
						if (code === 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		};
		
		const ContinueFunc = function() {
			fs.stat(fpathProcessedPrepare, function(err, stat) {
				if (stat) {
					ContinueFunc2();
				} else {
					let magik = spawn('convert', [fpath, '-resize', '640', fpathProcessedPrepare]);
					
					magik.stdout.pipe(process.stdout);
					magik.stderr.pipe(process.stdout);
					
					magik.on('close', function(code) {
						if (code === 0) {
							ContinueFunc2();
						} else {
							msg.reply('I am cracked up ;w;');
							msg.channel.stopTyping();
						}
					});
				}
			});
		};
		
		DBot.LoadImageURL(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});
