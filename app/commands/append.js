
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
const unirest = require('unirest');
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/append');

let fn = function(fName, i) {
	return function(args, cmd, msg) {
		let urlBuild = [];
		
		for (let i in args) {
			let arg = args[i];
			let url;
			
			if (typeof arg == 'object') {
				url = arg.avatarURL;
				
				if (!url)
					return DBot.CommandError('User have nu avatar :<', fName, args, Number(i) + 1);
			} else {
				url = arg;
			}
			
			if (!DBot.CheckURLImage(url))
				return DBot.CommandError('Invalid url maybe? ;w;', fName, args, Number(i) + 1);
			
			urlBuild.push(url);
		}
		
		if (urlBuild.length < 2)
			return 'Must specify at least two images';
		
		let sha = DBot.HashString(urlBuild.join(' '));
		let fpath = DBot.WebRoot + '/append/' + sha + '_' + i + '.png';
		let fpathU = DBot.URLRoot + '/append/' + sha + '_' + i + '.png';
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(fpathU);
			} else {
				let urlStrings = [];
				let left = urlBuild.length;
				
				let continueFunc = function() {
					let magikArgs = [];
					
					for (let ur of urlStrings) {
						magikArgs.push(ur);
					}
					
					magikArgs.push(arg, fpath);
					
					let magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('<internal pony error>');
						}
						
						msg.channel.stopTyping();
					});
				}
				
				for (let i in urlBuild) {
					DBot.LoadImageURL(urlBuild[i], function(newPath) {
						left--;
						urlStrings[i] = newPath;
						
						if (left == 0) {
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
}

module.exports = {
	name: 'append',
	alias: ['+append'],
	
	help_args: '<image1> <image2> ...',
	desc: 'Appends images at horisontal',
	allowUserArgument: true,
	
	func: fn('+append', 1),
}

DBot.RegisterCommand({
	name: 'vappend',
	alias: ['-append'],
	
	help_args: '<image1> <image2> ...',
	desc: 'Appends images at vertical',
	allowUserArgument: true,
	
	func: fn('-append', 2),
});

DBot.RegisterCommand({
	name: 'merge',
	
	help_args: '',
	desc: '',
	help_hide: true,
	
	func: function() {
		return 'There is no command named `merge`, but instead you can use `-append` (appends images at vertical) and +append (appends images at horisontal)';
	},
});
