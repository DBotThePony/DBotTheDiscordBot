
const child_process = require('child_process');
const spawn = child_process.spawn;
const unirest = require('unirest');
const fs = require('fs');
const URL = require('url');

Util.mkdir(DBot.WebRoot + '/waw');

const combinations = [
	[150, 50, -25],
	[135, 30, -10],
	[100, 50, -15],
	[75, 25, -15],
	[35, 20, -25],
	[0, 20, 0],
	[-25, 45, 35],
	[-25, 45, 65],
	[-45, 70, 75],
	[-65, 100, 135],
	[-45, 90, 100],
	[-10, 40, 70],
	[25, 25, 50],
	[65, 10, 10],
	[100, 25, 0],
	[135, 35, -10],
];

module.exports = {
	name: 'waw',
	alias: ['wow', 'drugs', 'lcd'],
	
	argNeeded: true,
	allowUserArgument: true,
	delay: 10,
	
	help_args: '<url or user>',
	desc: 'Spooks',
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof url == 'object') {
			url = args[0].avatarURL;
			
			if (!url)
				return DBot.CommandError('User have no avatar? ;n;', 'waw', args, 1);
		}
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'waw', args, 1);
		
		if (!DBot.CheckURLImage(url))
			return DBot.CommandError('Invalid url maybe? ;w;', 'waw', args, 1);
		
		let sha = DBot.HashString(url);
		
		let fpath;
		let fpathProcessed = DBot.WebRoot + '/waw/' + sha + '.gif';
		let fpathU = DBot.URLRoot + '/waw/' + sha + '.gif';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fpathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magikArgs = [];
					
					/*
					for (let red = -50; red < 50; red += 20) {
						for (let green = 50; green > -50; green -= 20) {
							for (let blue = 25; blue > -25; blue -= 15) {
								magikArgs.push(
									'(',
										fpath,
										'-colorize',
										red + ',' + green + ',' + blue,
									')'
								);
							}
						}
					}
					*/
					
					for (let comb of combinations) {
						magikArgs.push(
							'(',
								fpath,
								'-resize', '256x256>',
								'-colorize',
								comb[0] + ',' + comb[1] + ',' + comb[2],
							')'
						);
					}
					
					magikArgs.push(
						'-delay', '2',
						'-set', 'delay', '2',
						'-loop', '0',
						fpathProcessed
					);
					
					let magik = spawn('convert', magikArgs);
					
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
