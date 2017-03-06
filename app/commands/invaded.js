
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

fs.stat(DBot.WebRoot + '/invaded', function(err, stat) {
	if (!stat)
		fs.mkdir(DBot.WebRoot + '/invaded');
});

module.exports = {
	name: 'invaded',
	alias: ['invade'],
	
	help_args: '<user>',
	desc: 'INVASION',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (typeof(args[0]) != 'object')
			return 'Must be an user ;n;';
		
		let url = args[0].avatarURL;
		
		if (!url)
			return 'User have no avatar? ;w;';
		
		let hash = String.hash(url);
		
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/invaded/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/invaded/' + hash + '.png';
		
		msg.channel.startTyping();

		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat && stat.isFile()) {
					msg.reply(fPathProcessedURL);
					msg.channel.stopTyping();
				} else {
					let magik = spawn('convert', [
						fPath,
						'-resize', '512x512',
						'-color-matrix', '.3 .1 .3 .3 .1 .3 .3 .1 .3',
						'-draw', 'rectangle 0, 400, 512, 480',
						'-fill', 'black',
						'-gravity', 'South',
						'-fill', 'white',
						'-weight', 'Bold',
						'-pointsize', '24',
						'-draw', 'text 0,60 "' + args[0].username + ' has invaded!"',
						fPathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (msg.checkAbort()) return;
						msg.channel.stopTyping();
						
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('<internal pony error>');
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
