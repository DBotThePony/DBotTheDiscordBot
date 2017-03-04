
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

Util.mkdir(DBot.WebRoot + '/append');

let fn = function(fName, i, resize, fName2) {
	return function(args, cmd, msg) {
		let urlBuild = [];
		
		for (let i in args) {
			let arg = args[i];
			let url = CommandHelper.identifyURL(arg);
			
			if (!url)
				return DBot.CommandError('Invalid url maybe? ;w;', fName2, args, Number(i) + 1);
			
			urlBuild.push(url);
		}
		
		if (urlBuild.length < 2)
			return 'Must specify at least two images';
		
		let sha = String.hash(urlBuild.join(' '));
		let fpath = DBot.WebRoot + '/append/' + sha + '_' + i + '.png';
		let fpathU = DBot.URLRoot + '/append/' + sha + '_' + i + '.png';
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (msg.checkAbort()) return;
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(fpathU);
			} else {
				let urlStrings = [];
				let left = urlBuild.length;
				
				let continueFunc = function() {
					if (msg.checkAbort()) return;
					let magikArgs = [];
					
					for (let ur of urlStrings) {
						if (!resize)
							magikArgs.push(ur);
						else if (resize === 1)
							magikArgs.push('(', ur, '-resize', '512', ')');
						else if (resize === 2)
							magikArgs.push('(', ur, '-resize', 'x512', ')');
					}
					
					magikArgs.push(fName, fpath);
					
					let magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (msg.checkAbort()) return;
						if (code === 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('<internal pony error>');
						}
						
						msg.channel.stopTyping();
					});
				};
				
				for (let i in urlBuild) {
					DBot.LoadImageURL(urlBuild[i], function(newPath) {
						left--;
						urlStrings[i] = newPath;
						
						if (left === 0) {
							continueFunc();
						}
					}, function(result) {
						msg.channel.stopTyping();
						msg.reply('Failed to download image. `HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '` URL: ' + urlStrings[i]);
					});
				}
			}
		});
	};
};

module.exports = {
	name: 'append',
	alias: ['+append'],
	
	help_args: '<image1> <image2> ...',
	desc: 'Appends images at horisontal',
	allowUserArgument: true,
	
	func: fn('+append', 1, null, '+append')
};

DBot.RegisterCommand({
	name: 'vappend',
	alias: ['-append'],
	
	help_args: '<image1> <image2> ...',
	desc: 'Appends images at vertical',
	allowUserArgument: true,
	
	func: fn('-append', 2, null, '+append')
});

DBot.RegisterCommand({
	name: 'rappend',
	alias: ['r+append', '+rappend'],
	
	help_args: '<image1> <image2> ...',
	desc: 'Appends images at horisontal. Rescales every image',
	allowUserArgument: true,
	
	func: fn('+append', 3, 2, 'r+append')
});

DBot.RegisterCommand({
	name: 'rvappend',
	alias: ['r-append', '-rappend', 'vrappend'],
	
	help_args: '<image1> <image2> ...',
	desc: 'Appends images at vertical. Rescales every image',
	allowUserArgument: true,
	
	func: fn('-append', 4, 1, 'r-append')
});

DBot.RegisterCommand({
	name: 'merge',
	
	help_args: '',
	desc: '',
	help_hide: true,
	
	func: function() {
		return 'There is no command named `merge`, but instead you can use `-append` (appends images at vertical) and +append (appends images at horisontal)';
	}
});
