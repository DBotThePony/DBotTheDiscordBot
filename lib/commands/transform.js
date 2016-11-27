
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

var font = 'Hack-Regular';
var size = 48;

Util.mkdir(DBot.WebRoot + '/text');

module.exports = {
	name: 'transform',
	alias: ['transf', 'textt'],
	
	help_args: '<phrase1> <phrase2>',
	desc: 'Tries to transform one phrase into another',
	
	func: function(args, cmd, rawcmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['transform'], 2, args);
		
		if (!args[1])
			return 'Need second phrase ;w;' + Util.HighlightHelp(['transform'], 3, args);
		
		if (args[0].length > 400)
			return 'Ugh, too big!';
		
		var cont;
		
		for (let i = 1; i < args.length; i++) {
			if (cont)
				cont += ' ' + args[i];
			else
				cont = args[i];
		}
		
		if (cont.length > 400)
			return 'Ugh, too big!';
		
		var compareI = Math.min(args[0].length, cont.length);
		var sameUntil = 0;
		
		var comp1 = args[0].toLowerCase();
		var comp2 = cont.toLowerCase();
		
		for (let i = 0; i < compareI; i++) {
			if (comp1[i] == comp2[i])
				sameUntil++;
			else
				break;
		}
		
		if (sameUntil == 0) {
			return 'Strings must be equal at least in the start';
		}
		
		var build = args[0];
		
		for (let i = args[0].length; i >= sameUntil; i--) {
			if (args[0].substr(0, i) == build)
				continue; // wtf
			
			build += '\n' + args[0].substr(0, i);
		}
		
		for (let i = sameUntil + 1; i <= cont.length; i++) {
			build += '\n' + cont.substr(0, i);
		}
		
		if (build.length > 400)
			return 'Ugh, too big!';
		
		return '\n```' + build + '```';
	},
}

DBot.RegisterCommand({
	name: 'itransform',
	alias: ['itransf', 'itextt'],
	
	help_args: '<phrase1> <phrase2>',
	desc: 'Tries to transform one phrase into another, but posts an image instead of text',
	
	func: function(args, cmd, rawcmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['transform'], 2, args);
		
		if (!args[1])
			return 'Need second phrase ;w;' + Util.HighlightHelp(['transform'], 3, args);
		
		if (args[0].length > 400)
			return 'Ugh, too big!';
		
		var cont;
		
		for (let i = 1; i < args.length; i++) {
			if (cont)
				cont += ' ' + args[i];
			else
				cont = args[i];
		}
		
		if (cont.length > 400)
			return 'Ugh, too big!';
		
		var compareI = Math.min(args[0].length, cont.length);
		var sameUntil = 0;
		
		var comp1 = args[0].toLowerCase();
		var comp2 = cont.toLowerCase();
		
		for (let i = 0; i < compareI; i++) {
			if (comp1[i] == comp2[i])
				sameUntil++;
			else
				break;
		}
		
		if (sameUntil == 0) {
			return 'Strings must be equal at least in the start';
		}
		
		var build = args[0];
		
		for (let i = args[0].length; i >= sameUntil; i--) {
			if (args[0].substr(0, i) == build)
				continue; // wtf
			
			build += '\n' + args[0].substr(0, i);
		}
		
		for (let i = sameUntil + 1; i <= cont.length; i++) {
			build += '\n' + cont.substr(0, i);
		}
		
		var splitLines = build.split('\n');
		
		var max = 0;
		
		for (var i in splitLines) {
			if (splitLines[i].length > max)
				max = splitLines[i].length;
		}
		
		var sha = DBot.HashString(build);
		var fpath = DBot.WebRoot + '/text/' + sha + '.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '.png';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.reply(fpathU);
			} else {
				var calcHeight = splitLines.length * size * 1.5;
				var calcWidth = max * size * .6 + 40;
				
				var magikArgs = [
					'-size', calcWidth + 'x' + calcHeight,
					'canvas:none',
					'-pointsize', size,
					'-font', font,
					'-gravity', 'North',
					'-fill', 'black',
				];
				
				for (var i in splitLines) {
					var line = splitLines[i];
					
					magikArgs.push('-draw', 'text 0,' + (i * size * 1.5) + ' "' + line.replace(/"/g, "'") + '"');
				}
				
				magikArgs.push(fpath);
				
				var magik = spawn('convert', magikArgs);
				
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
