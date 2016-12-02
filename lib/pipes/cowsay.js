
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

var font = 'Hack-Regular';
var size = 48;
var cowsay = require('cowsay');

Util.mkdir(DBot.WebRoot + '/cowsay');

var cows = [
	'cow',
	'tux',
	'sheep',
	'www',
	'dragon',
	'vader',
];

cows.forEach(function(item) {
	DBot.RegisterPipe({
		id: item + 'say',
		name: item + 'say',
		alias: [item],
		
		help_args: '<phrase> ...',
		desc: 'Say TEH word',
		
		func: function(args, cmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			var result = cowsay.say({
				text: cmd,
				f: ask,
			});
			
			return '```' + result + '```';
		},
	});
	
	DBot.RegisterPipe({
		id: 'i' + item + 'say',
		name: 'i' + item + 'say',
		alias: ['i' + item],
		
		help_args: '<phrase> ...',
		desc: 'Renders TEH word as image',
		
		func: function(args, cmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			var sha = DBot.HashString(cmd);
			var fpath = DBot.WebRoot + '/cowsay/' + sha + '_' + item + '.png';
			var fpathU = DBot.URLRoot + '/cowsay/' + sha + '_' + item + '.png';
			
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.reply(fpathU);
				} else {
					var result = cowsay.say({
						text: cmd,
						f: ask,
					});
					
					var splitLines = result.split('\n');
					
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
					
					for (var i in splitLines) {
						var line = splitLines[i];
						
						magikArgs.push('-draw', 'text 0,' + (i * size * 1.1) + ' "' + line.replace(/"/g, "'") + '"');
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
			
			return true;
		},
	});
	
	DBot.RegisterPipe({
		id: 'l' + item + 'say',
		name: 'l' + item + 'say',
		alias: ['l' + item, 'lol' + item, 'lol' + item + 'say'],
		
		help_args: '<phrase> ...',
		desc: 'Renders TEH word as image + lolcat',
		
		func: function(args, cmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			var sha = DBot.HashString(cmd);
			var fpath = DBot.WebRoot + '/cowsay/' + sha + '_' + item + '_lolcat.png';
			var fpathU = DBot.URLRoot + '/cowsay/' + sha + '_' + item + '_lolcat.png';
			
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.reply(fpathU);
				} else {
					var result = cowsay.say({
						text: cmd,
						f: ask,
					});
					
					var splitLines = result.split('\n');
					
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
				}
			});
			
			return true;
		},
	});
});
