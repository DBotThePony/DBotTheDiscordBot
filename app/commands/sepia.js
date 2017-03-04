
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

Util.mkdir(DBot.WebRoot + '/sepia');

module.exports = {
	name: 'sepia',
	
	help_args: '<url>',
	desc: 'Edits image with sepia effect',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		const data = CommandHelper.switchImageArgs(msg.channel, args, 10);
		const num = MathHelper.Clamp(data[0], 1, 100);
		const url = data[1];
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'sepia', args, 1);
		
		let fPath;
		const sha = String.hash(url);
		const fPathProcessed = DBot.WebRoot + '/sepia/' + sha + '.png';
		const fPathProcessedURL = DBot.URLRoot + '/sepia/' + sha + '.png';
		
		msg.channel.startTyping();
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', [fPath, '-sepia-tone', num + '%', fPathProcessed]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (!code) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('*squeak*');
						}
					});
				}
			});
		};
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
};

