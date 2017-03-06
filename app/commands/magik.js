
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

Util.mkdir(DBot.WebRoot + '/magik');

const combinations = [
	['40', '160'],
	['50', '150'],
	['60', '140'],
];

module.exports = {
	name: 'magik',
	alias: ['magic', 'magick'],
	
	help_args: '<url>',
	desc: 'Broken seam-carving resize ;n;',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'magik', args, 1);
		
		let hash = String.hash(url);
		
		let comb1 = Array.Random(combinations);
		let comb2 = Array.Random(combinations);
		
		let selectedDimensions = comb1[0] + '%x' + comb2[0] + '%';
		let selectedDimensions2 = comb1[1] + '%x' + comb2[1] + '%';
		
		let fPath;
		
		let newHash = String.hash(url + ' ' + selectedDimensions);
		
		let fPathProcessed = DBot.WebRoot + '/magik/' + newHash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/magik/' + newHash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', ['(', '(', fPath, '-resize', '2000x2000>', ')', '-liquid-rescale', selectedDimensions, ')', '-resize', selectedDimensions2, fPathProcessed]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
					});
				}
			});
		}
		
		CommandHelper.loadImage(url, function(newPath) {
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
		
		CommandHelper.loadImage(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
});
