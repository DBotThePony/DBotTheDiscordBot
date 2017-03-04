
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/glitch');

module.exports = {
	name: 'glitch',
	
	help_args: '<url>',
	desc: 'Glitches the image',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'glitch', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		let fPathProcessed = DBot.WebRoot + '/glitch/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/glitch/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', [
						'(', fPath, '-resize', '1024x1024>', ')', '-alpha', 'on', '(', '-clone', '0', '-channel', 'RGB', '-separate', '-channel', 'A', '-fx', '0', '-compose', 'CopyOpacity', '-composite', ')', '(', '-clone', '0', '-roll', '+5', '-channel', 'R', '-fx', '0', '-channel', 'A', '-evaluate', 'multiply', '.3', ')', '(', '-clone', '0', '-roll', '-5', '-channel', 'G', '-fx', '0', '-channel', 'A', '-evaluate', 'multiply', '.3', ')', '(', '-clone', '0', '-roll', '+0+5', '-channel', 'B', '-fx', '0', '-channel', 'A', '-evaluate', 'multiply', '.3', ')', '(', '-clone', '0', '-channel', 'A', '-fx', '0', ')', '-delete', '0', '-background', 'none', '-compose', 'SrcOver', '-layers', 'merge', '-rotate', '90', '-wave', '1x5', '-rotate', '-90', fPathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						msg.reply(fPathProcessedURL);
					});
				}
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
	name: 'glitch2',
	
	help_args: '<url>',
	desc: 'Glitches the image by messing up it\'s bytes',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'glitch', args, 1);
		
		let hash = String.hash(CurTime().toString());
		
		let fPath;
		let fPathProcessed = DBot.WebRoot + '/glitch/' + hash + '.jpg';
		let fPathProcessedURL = DBot.URLRoot + '/glitch/' + hash + '.jpg';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			let magik = spawn('convert', [fPath, '-resize', '1500x1500>', 'jpg:-']);
			
			let output2 = '';
			
			magik.stdout.on('data', function(chunk) {
				output2 += chunk.toString('base64');
			});
			
			magik.on('close', function(code) {
				if (code != 0) {
					msg.channel.stopTyping();
					msg.reply('*sqeaks*');
					return;
				}
				
				let output = Buffer.from(output2, 'base64');
				let step = Math.floor(output.length / Math.Random(150, 300));
				
				for (let i = 400; i < output.length - 200; i += step) {
					if (Math.Random(1, 100) > 40) {
						output[i] = Math.Random(50, 180);
					}
				}
				
				let stream = fs.createWriteStream(fPathProcessed);
				stream.write(output);
				stream.end();
				stream.on('finish', function() {
					msg.channel.stopTyping();
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
