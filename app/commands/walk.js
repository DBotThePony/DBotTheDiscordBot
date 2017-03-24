
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const spawn = require('child_process').spawn;
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/walk');

module.exports = {
	name: 'walk',
	alias: ['adw', 'adminwalk', 'admincommunitywalk'],
	
	help_args: '<url>',
	desc: 'an admin is taking his community for a little walk',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		const url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'walk', args, 1);
		
		const sha = String.hash(url);
		
		let fPath;
		
		const fPathProcessed = DBot.WebRoot + '/walk/' + sha + '.png';
		const fPathProcessedURL = DBot.URLRoot + '/walk/' + sha + '.png';
		
		msg.channel.startTyping();
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			
			fs.stat(fPathProcessed, (_, stat) => {
				if (msg.checkAbort()) return;
				
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					const magik = spawn('convert', [
						'-alpha', 'on', './resource/files/walk.png', '(', fPath, '-resize', '127x127', '-size', '700x700',
						'xc:none', '-layers', 'merge', '-roll', '+382+118', ')', '+swap',
						'-gravity', 'northwest', '-layers', 'merge', fPathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', (code) => {
						if (code === 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
							msg.reply('<internal pony error>');
						}
					});
				}
			});
		};
		
		CommandHelper.loadImage(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. `HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '`');
		});
	}
};
