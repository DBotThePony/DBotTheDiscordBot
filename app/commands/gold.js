
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

Util.mkdir(DBot.WebRoot + '/gold');

module.exports = {
	name: 'gold',
	alias: [],
	
	help_args: '<phrase>',
	desc: '+gold',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('Invalid phrase', 'gold', args, 1);
		
		let sha = String.hash(cmd);
		
		let fPathProcessed = DBot.WebRoot + '/gold/' + sha + '.jpg';
		let fPathProcessedURL = DBot.URLRoot + '/gold/' + sha + '.jpg';
		
		msg.channel.startTyping();
		
		fs.stat(fPathProcessed, function(err, stat) {
			if (msg.checkAbort()) return;
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(fPathProcessedURL);
			} else {
				let esc = Postgres.escape('+' + cmd);
				let magik = spawn('convert', [
					'./resource/files/wc3.jpg',
					'-gravity', 'center',
					'-pointsize', '48',
					
					'-draw', 'fill gold text 0,-50 ' + esc + ' fill rgba(255,215,0,0.6) text 0,-180 ' + esc + ' fill rgba(255,215,0,0.3) text 0,-300 ' + esc,
					
					fPathProcessed
				]);
				
				magik.on('close', function(code) {
					if (msg.checkAbort()) return;
					msg.channel.stopTyping();
					
					if (code == 0) {
						msg.reply(fPathProcessedURL);
					} else {
						msg.reply('*Pone breaks and squeaks*');
					}
				});
			}
		});
	}
}
