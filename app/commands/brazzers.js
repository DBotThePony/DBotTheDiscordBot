
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');
const aspectRatio = 153 / 800;

Util.mkdir(DBot.WebRoot + '/brazzers');

module.exports = {
	name: 'brazzers',
	
	help_args: '<url>',
	desc: 'Puts a logo on an image',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'brazzers', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/brazzers/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/brazzers/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					IMagick.Identify(fPath, function(err, ftype, width, height) {
						if (msg.checkAbort()) return;
						if (err) {
							msg.channel.stopTyping();
							msg.reply('<internal pone error>');
							return;
						}
						
						let logoWidth = width * .5;
						let logoHeight = logoWidth * aspectRatio;
						let start = width - logoWidth - width * .04;
						let hStart = height - logoHeight - height * .04;
						
						let magik = spawn('convert', [fPath, '-draw', 'image srcover ' + start + ',' + hStart + ' ' + logoWidth + ',' + logoHeight + ' "./resource/files/brazzers.png"', fPathProcessed]);
						
						Util.Redirect(magik);
						
						magik.on('close', function(code) {
							if (msg.checkAbort()) return;
							msg.channel.stopTyping();
							
							if (code == 0) {
								msg.reply(fPathProcessedURL);
							} else {
								msg.reply('<internal pone error>');
							}
						});
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
	name: 'gmagik',
	alias: ['gmagic', 'gmagick'],
	
	help_args: '<url>',
	desc: 'Broken seam-carving resize ;n; as gif',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'magik', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/magik/' + hash + '.gif';
		let fPathProcessedURL = DBot.URLRoot + '/magik/' + hash + '.gif';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magikArgs = ['(', fPath, '-resize', '256x256>', '-resize', '256x256<', ')',];
					
					for (let i = 5; i <= 70; i += 5) {
						magikArgs.push('(', '-clone', '0', '(', '+clone', '-liquid-rescale', (100 - i) + '%', ')', '(', '+clone', '-resize', '256', ')', '-delete', '-2', '-delete', '-2', ')');
					}
					
					magikArgs.push('-delay', '8', '-set', 'delay', '8', fPathProcessed);
					
					let magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
							msg.reply('*sqeaks*');
						}
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
});
