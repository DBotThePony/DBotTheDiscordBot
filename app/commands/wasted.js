
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
const URL = require('url');
const unirest = require('unirest');
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/wasted');

const allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'wasted',
	
	help_args: '<user>',
	desc: 'wasted',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'wasted', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/wasted/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/wasted/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					IMagick.Identify(fPath, function(err, fileType, width, height, aspectRatio, aspectRatio2) {
						if (msg.checkAbort()) return;
						if (err) {
							msg.channel.stopTyping();
							msg.reply('<internal pony error>');
							return;
						}

						let magikArgs = [fPath];

						if (width < 512) {
							magikArgs.push('-resize');

							width = 512;
							height = Math.floor(aspectRatio * 512);

							magikArgs.push('512x' + height);
						}

						if (height < 512) {
							magikArgs.push('-resize');

							height = 512;
							width = Math.floor(aspectRatio2 * 512);

							magikArgs.push(width);
						}

						if (width > 1500 || height > 1500)
							msg.reply('Big Picture OwO, Cropping to 1500x1500');

						if (width > 1500) {
							magikArgs.push('-resize');

							width = 1500;
							height = Math.floor(aspectRatio * 1500);

							magikArgs.push('1500x' + height);
						}

						if (height > 1500) {
							magikArgs.push('-resize');

							height = 1500;
							width = Math.floor(aspectRatio2 * 1500);

							magikArgs.push(width);
						}

						magikArgs.push('-color-matrix', '.3 .1 .3 .3 .1 .3 .3 .1 .3', '-fill', 'rgba(0,0,0,0.5)');

						let signHeight = height * .2;

						magikArgs.push('-draw', 'rectangle 0, ' + (height / 2 - signHeight / 2) + ', ' + width + ', ' + (height / 2 + signHeight / 2));

						magikArgs.push(
							'-gravity', 'South',
							'-font', 'PricedownBl-Regular',
							'-fill', 'rgb(200,30,30)',
							'-stroke', 'black',
							'-strokewidth', '3',
							'-weight', '300'
						);

						magikArgs.push('-pointsize', String(Math.floor(signHeight * .8)), '-draw', 'text 0,' + (Math.floor(height / 2 - signHeight * .45)) + ' "wasted"');

						magikArgs.push(fPathProcessed);

						let magik = spawn('convert', magikArgs);

						Util.Redirect(magik);

						magik.on('close', function(code) {
							msg.channel.stopTyping();

							if (code == 0) {
								msg.reply(fPathProcessedURL);
							} else {
								msg.reply('<internal pony error>');
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
	name: 'dead',
	alias: ['youdied', 'youdead', 'youaredead', 'youareded', 'youdied'],
	
	help_args: '<user>',
	desc: 'YOU DIED',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['dead'], 2, args);
			}
		}
		
		let hash = String.hash(url);
		
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['dead'], 2, args);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/wasted/' + hash + '_s.png';
		let fPathProcessedURL = DBot.URLRoot + '/wasted/' + hash + '_s.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					IMagick.Identify(fPath, function(err, fileType, width, height, aspectRatio, aspectRatio2) {
						if (msg.checkAbort()) return;
						if (err) {
							msg.channel.stopTyping();
							msg.reply('<internal pony error>');
							return;
						}
						
						let magikArgs = [fPath];

						if (width < 512) {
							magikArgs.push('-resize');

							width = 512;
							height = Math.floor(aspectRatio * 512);

							magikArgs.push('512x' + height);
						}

						if (height < 512) {
							magikArgs.push('-resize');

							height = 512;
							width = Math.floor(aspectRatio2 * 512);

							magikArgs.push(width);
						}

						if (width > 1500 || height > 1500)
							msg.reply('Big Picture OwO, Cropping to 1500x1500');

						if (width > 1500) {
							magikArgs.push('-resize');

							width = 1500;
							height = Math.floor(aspectRatio * 1500);

							magikArgs.push('1500x' + height);
						}

						if (height > 1500) {
							magikArgs.push('-resize');

							height = 1500;
							width = Math.floor(aspectRatio2 * 1500);

							magikArgs.push(width);
						}

						magikArgs.push('-color-matrix', '.3 .1 .3 .3 .1 .3 .3 .1 .3', '-fill', 'rgba(0,0,0,0.05)');

						let signHeight = height / 5;
						let internsShadowCount = Math.floor(signHeight / 4);

						for (let i = internsShadowCount; i >= 0; i--) {
							magikArgs.push('-draw', 'rectangle 0, ' + (height / 2 - signHeight / 2 - i) + ', ' + width + ', ' + (height / 2 + signHeight / 2 + i));
						}

						magikArgs.push(
							'-gravity', 'South',
							'-font', 'OptimusPrinceps',
							'-fill', 'rgb(160,30,30)',
							'-stroke', 'black'
						);

						magikArgs.push('-pointsize', String(signHeight), '-draw', 'text 0,' + (height / 2 - signHeight * .5) + ' "YOU DIED"');

						magikArgs.push(fPathProcessed);

						let magik = spawn('convert', magikArgs);

						Util.Redirect(magik);

						magik.on('close', function(code) {
							if (code == 0) {
								msg.reply(fPathProcessedURL);
							} else {
								msg.reply('<internal pony error>');
							}

							msg.channel.stopTyping();
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
});
