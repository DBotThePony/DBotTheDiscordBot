
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

var font = 'Hack-Regular';
var size = 48;

Util.mkdir(DBot.WebRoot + '/text');

module.exports = {
	name: 'draw',
	alias: ['text', 'drawtext'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font.',
	argNeeded: true,
	
	func: function(args, cmd, rawcmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		var splitLines = cmd.split('\n');
		
		var max = 0;
		
		for (var i in splitLines) {
			if (splitLines[i].length > max)
				max = splitLines[i].length;
		}
		
		var sha = DBot.HashString(cmd);
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
	}
}

DBot.RegisterCommand({
	name: 'lolcat',
	alias: ['ltext', 'drawltext', 'ldraw'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour',
	argNeeded: true,
	
	func: function(args, cmd, rawcmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_lolcat.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_lolcat.png';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.reply(fpathU);
			} else {
				var splitLines = cmd.split('\n');
				
				var max = 0;
				
				for (var i in splitLines) {
					if (splitLines[i].length > max)
						max = splitLines[i].length;
				}
				
				var charWidth = max;
				var charHeight = splitLines.length;
				
				var calcHeight = splitLines.length * size * 1.5;
				var calcWidth = max * size * .6 + 20;
				
				var magikArgs = [
					'-size', calcWidth + 'x' + calcHeight,
					'canvas:none',
					'-pointsize', size,
					'-font', font,
					'-gravity', 'NorthWest',
				];
				
				for (let lineNum in splitLines) {
					let line = splitLines[lineNum];
					
					for (let charNum in line) {
						let red = Math.cos(lineNum / charHeight - charNum / line.length) * 127 + 128;
						let green = Math.sin(charNum / line.length - lineNum / charHeight) * 127 + 128;
						let blue = Math.sin(lineNum / charHeight - charNum / line.length) * 127 + 128;
						
						magikArgs.push('-fill', 'rgb(' + red + ',' + green + ',' + blue + ')', '-draw', 'text ' + (charNum * size * .6) + ',' + (lineNum * size * 1.5) + ' "' + line[charNum] + '"');
					}
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
	}
});

DBot.RegisterCommand({
	name: 'comicsans',
	alias: ['sans', 'csans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses COMIC SAAAAAAAAAAAAAAAAANS #$@&&@*&#!',
	argNeeded: true,
	
	func: function(args, cmd, rawcmd, msg) {
		if (cmd.length > 8000)
			return 'Too big!';
		
		var splitLines = cmd.split('\n');
		
		var max = 0;
		
		for (var i in splitLines) {
			if (splitLines[i].length > max)
				max = splitLines[i].length;
		}
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_s.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_s.png';
		
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
					'-font', 'Comic-Sans-MS',
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
	}
});
