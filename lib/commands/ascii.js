
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

const font = 'Hack-Regular';
const size = 48;

Util.mkdir(DBot.WebRoot + '/text');
const figlet = require('figlet');

module.exports = {
	name: 'ascii',
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase> ...',
	desc: 'Turn chars into ASCII art\nUses figlet library',
	
	func: function(args, cmd, msg) {
		if (cmd.length > 10 && !DBot.IsPM(msg))
			return 'Too big!';
		
		if (cmd.length > 30)
			return 'Too big!';
		
		figlet.text(cmd, {
			kerning: 'full',
		}, function(err, data) {
			if (err) {
				msg.reply('<internal pony error>')
				return;
			}
			
			msg.reply('```' + data + '```');
		});
	},
}

DBot.RegisterCommandPipe({
	name: 'iascii',
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase> ...',
	desc: 'Turn chars into ASCII art as image\nUses figlet library',
	
	func: function(args, cmd, msg) {
		if (cmd.length > 400)
			return 'You wot';
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_figlet.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_figlet.png';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.reply(fpathU);
			} else {
				figlet.text(cmd, {
					kerning: 'full',
				}, function(err, data) {
					if (err) {
						msg.reply('<internal pony error>')
						return;
					}
					
					var splitLines = data.split('\n');
					
					var max = 0;
					
					for (var i in splitLines) {
						if (splitLines[i].length > max)
							max = splitLines[i].length;
					}
					
					var calcHeight = splitLines.length * size * 1.1;
					var calcWidth = max * size * .6 + 40;
					
					var magikArgs = [
						'-size', calcWidth + 'x' + calcHeight,
						'canvas:none',
						'-pointsize', size,
						'-font', font,
						'-gravity', 'NorthWest',
						'-fill', 'black',
					];
					
					for (let i in splitLines) {
						var line = splitLines[i];
						
						magikArgs.push('-draw', 'text 0,' + (i * size * 1.1) + ' "' + line.replace(/"/g, "'").replace(/\\/g, "\\\\") + '"');
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
				});
			}
		});
		
		return true;
	}
});

DBot.RegisterCommandPipe({
	name: 'lascii',
	alias: ['lolascii', 'lolcatascii'],
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase> ...',
	desc: 'Turn chars into ASCII art as image\nUses figlet library\nAlso applies lolcat',
	
	func: function(args, cmd, msg) {
		if (cmd.length > 400)
			return 'You wot';
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_figlet_lolcat.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_figlet_lolcat.png';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.reply(fpathU);
			} else {
				figlet.text(cmd, {
					kerning: 'full',
				}, function(err, data) {
					if (err) {
						msg.reply('<internal pony error>')
						return;
					}
					
					var splitLines = data.split('\n');
					
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
							let red = Math.cos(lineNum / charHeight * 3 - charNum / line.length * 2) * 127 + 128;
							let green = Math.sin(charNum / line.length - lineNum / charHeight * 5) * 127 + 128;
							let blue = Math.sin(lineNum / charHeight * 2 - charNum / line.length * 3) * 127 + 128;
							
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
				});
			}
		});
		
		return true;
	}
});

