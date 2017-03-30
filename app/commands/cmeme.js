
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
const URL = require('url');
const unirest = require('unirest');
const fs = require('fs');

hook.Add('PrecacheFonts', 'CMeme', function() {
	IMagick.PrecacheFont('Impact');
});

fs.stat(DBot.WebRoot + '/cmeme', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/cmeme');
});

let allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'cmeme',
	alias: ['bmeme', 'meme'],
	
	help_args: '<url> <top text> [bottom text]',
	desc: 'Tries to parody meme generator. URL can be user with valid avatar. If you want top text with spaces,\nyou should put text in single or double quotes.\nThere is no need to put bottom text in quotes, all arguments are concated into one bottom string.',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'cmeme', args, 1);
		
		const topText = args[1];
		let bottomText;
		
		for (let i = 2; i < args.length; i++) {
			if (bottomText)
				bottomText += ' ' + args[i];
			else
				bottomText = args[i];
		}
		
		if (!topText && !bottomText)
			return DBot.CommandError('At least top or bottom text is required', 'cmeme', args, 1);
		
		
		const hash = String.hash(url + 'top_' + (topText || '___') + 'bottom_' + (bottomText || '___'));
		
		let fPath;
		
		const fPathProcessed = DBot.WebRoot + '/cmeme/' + hash + '.png';
		const fPathProcessedURL = DBot.URLRoot + '/cmeme/' + hash + '.png';
		
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
						
						let args = [fPath];
						
						if (width < 256) {
							args.push('-resize');
							
							width = 256;
							height = Math.floor(aspectRatio * 256);
							
							args.push('256x' + height);
						}
						
						if (height < 256) {
							args.push('-resize');
							
							height = 256;
							width = Math.floor(aspectRatio2 * 256);
							
							args.push(width);
						}
						
						if (width > 1500 || height > 1500)
							msg.reply('Big Picture OwO, Cropping to 1500x1500');
						
						if (width > 1500) {
							args.push('-resize');
							
							width = 1500;
							height = Math.floor(aspectRatio * 1500);
							
							args.push('1500x' + height);
						}
						
						if (height > 1500) {
							args.push('-resize');
							
							height = 1500;
							width = Math.floor(aspectRatio2 * 1500);
							
							args.push(width);
						}
						
						height = Math.floor(height);
						width = Math.floor(width);
						
						args.push(
							'-gravity', 'South', '-font', 'Impact', '-fill', 'white', '-stroke',
							'black', '-strokewidth', '2', '-weight', '500'
						);
				
						if (topText) {
							args.push('-pointsize');
							
							let fSize = IMagick.GetTextSize(topText, 'Impact', 1);
							let calc = (width - 40) / fSize[0];
							
							if (calc > height / 4) {
								calc = Math.floor(height / 4);
							} else if (calc < 18) {
								calc = 18;
							}
							
							args.push(String(calc));
							
							args.push('-draw');
							args.push('text 0,' + (calc * 0.2) + ' "' + topText + '"');
						}
						
						if (bottomText) {
							args.push('-pointsize');
							
							let fSize = IMagick.GetTextSize(bottomText, 'Impact', 1);
							let calc = (width - 40) / fSize[0];
							
							if (calc > height / 4) {
								calc = Math.floor(height / 4);
							} else if (calc < 18) {
								calc = 18;
							}
							
							args.push(String(calc));
							
							args.push('-draw');
							args.push('text 0,' + (calc * 0.2) + ' "' + bottomText + '"');
						}
						
						args.push(fPathProcessed);
						
						let magik = spawn('convert', args);
						
						Util.Redirect(magik);
						
						magik.on('close', function(code) {
							if (msg.checkAbort()) return;
							
							if (code === 0) {
								msg.reply(fPathProcessedURL);
							} else {
								msg.reply('<internal pony error>');
							}
							
							msg.channel.stopTyping();
						});
					});
				}
			});
		};
		
		CommandHelper.loadImage(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}
