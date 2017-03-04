
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

const font = 'Hack-Regular';
const size = 48;

Util.mkdir(DBot.WebRoot + '/text');

module.exports = {
	name: 'transform',
	alias: ['transf', 'textt'],
	
	help_args: '<phrase1> <phrase2>',
	desc: 'Tries to transform one phrase into another',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['transform'], 2, args);
		
		if (!args[1])
			return 'Need second phrase ;w;' + Util.HighlightHelp(['transform'], 3, args);
		
		if (args[0].length > 400)
			return 'Ugh, too big!';
		
		let cont;
		
		for (let i = 1; i < args.length; i++) {
			if (cont)
				cont += ' ' + args[i];
			else
				cont = args[i];
		}
		
		if (cont.length > 400)
			return 'Ugh, too big!';
		
		let compareI = Math.min(args[0].length, cont.length);
		let sameUntil = 0;
		
		let comp1 = args[0].toLowerCase();
		let comp2 = cont.toLowerCase();
		
		for (let i = 0; i < compareI; i++) {
			if (comp1[i] == comp2[i])
				sameUntil++;
			else
				break;
		}
		
		if (sameUntil == 0) {
			return 'Strings must be equal at least in the start';
		}
		
		let build = args[0];
		
		for (let i = args[0].length + 1; i >= sameUntil; i--) {
			let sub = args[0].substr(0, i)
			if (sub == build)
				continue; // wtf
			
			if (sub[sub.length - 1] == ' ')
				continue;
			
			build += '\n' + sub;
		}
		
		for (let i = sameUntil + 1; i <= cont.length; i++) {
			let sub = cont.substr(0, i)
			
			if (sub[sub.length - 1] == ' ')
				continue;
			
			build += '\n' + sub;
		}
		
		if (build.length > 400)
			return 'Ugh, too big!';
		
		return ' ```\n' + build + '\n```';
	},
}

DBot.RegisterCommand({
	name: 'itransform',
	alias: ['itransf', 'itextt'],
	
	help_args: '<phrase1> <phrase2>',
	desc: 'Tries to transform one phrase into another, but posts an image instead of text',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['transform'], 2, args);
		
		if (!args[1])
			return 'Need second phrase ;w;' + Util.HighlightHelp(['transform'], 3, args);
		
		if (args[0].length > 400)
			return 'Ugh, too big!';
		
		let cont;
		
		for (let i = 1; i < args.length; i++) {
			if (cont)
				cont += ' ' + args[i];
			else
				cont = args[i];
		}
		
		if (cont.length > 400)
			return 'Ugh, too big!';
		
		let compareI = Math.min(args[0].length, cont.length);
		let sameUntil = 0;
		
		let comp1 = args[0].toLowerCase();
		let comp2 = cont.toLowerCase();
		
		for (let i = 0; i < compareI; i++) {
			if (comp1[i] == comp2[i])
				sameUntil++;
			else
				break;
		}
		
		if (sameUntil == 0) {
			return 'Strings must be equal at least in the start';
		}
		
		let build = args[0];
		
		for (let i = args[0].length + 1; i >= sameUntil; i--) {
			if (args[0].substr(0, i) == build)
				continue; // wtf
			
			build += '\n' + args[0].substr(0, i);
		}
		
		for (let i = sameUntil + 1; i <= cont.length; i++) {
			let sub = cont.substr(0, i)
			
			if (sub[sub.length - 1] == ' ')
				continue;
			
			build += '\n' + sub;
		}
		
		let splitLines = build.split('\n');
		
		let max = 0;
		
		for (let i in splitLines) {
			if (splitLines[i].length > max)
				max = splitLines[i].length;
		}
		
		let sha = String.hash(build);
		let fpath = DBot.WebRoot + '/text/' + sha + '.png';
		let fpathU = DBot.URLRoot + '/text/' + sha + '.png';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.reply(fpathU);
			} else {
				let calcHeight = splitLines.length * size * 1.5;
				let calcWidth = max * size * .6 + 40;
				
				let magikArgs = [
					'-size', calcWidth + 'x' + calcHeight,
					'canvas:none',
					'-pointsize', size,
					'-font', font,
					'-gravity', 'North',
					'-fill', 'black',
				];
				
				for (let i in splitLines) {
					let line = splitLines[i];
					
					magikArgs.push('-draw', 'text 0,' + (i * size * 1.5) + ' "' + line.replace(/"/g, "'") + '"');
				}
				
				magikArgs.push(fpath);
				
				let magik = spawn('convert', magikArgs);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code == 0) {
						msg.reply(fpathU);
					} else {
						msg.reply('<internal pony error>');
					}
				});
			}
		});
	},
});
