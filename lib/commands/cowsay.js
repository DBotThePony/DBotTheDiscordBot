
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

var font = 'Hack-Regular';
var size = 48;
var cowsay = require('cowsay');

Util.mkdir(DBot.WebRoot + '/cowsay', function() {
	Util.mkdir(DBot.WebRoot + '/cowsay/temp');
});

var cows = [
	'cow',
	'tux',
	'sheep',
	'www',
	'dragon',
	'vader',
];

cows.forEach(function(item) {
	DBot.RegisterCommandPipe({
		id: item + 'say',
		name: item + 'say',
		alias: [item],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Say TEH word',
		
		func: function(args, cmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			var result = cowsay.say({
				text: cmd.replace(/`/gi, ''),
				f: ask,
			});
			
			return '```' + result + '```';
		},
	});
	
	DBot.RegisterCommandPipe({
		id: 'i' + item + 'say',
		name: 'i' + item + 'say',
		alias: ['i' + item],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Renders TEH word as image',
		
		func: function(args, cmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			var sha = DBot.HashString(cmd);
			var fpath = DBot.WebRoot + '/cowsay/' + sha + '_' + item + '.png';
			var fpathU = DBot.URLRoot + '/cowsay/' + sha + '_' + item + '.png';
			
			msg.channel.startTyping();
			
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					var result = cowsay.say({
						text: cmd.replace(/`/gi, ''),
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
						
						msg.channel.stopTyping();
					});
				}
			});
			
			return true;
		},
	});
	
	DBot.RegisterCommandPipe({
		id: 'l' + item + 'say',
		name: 'l' + item + 'say',
		alias: ['l' + item, 'lol' + item, 'lol' + item + 'say'],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Renders TEH word as image + lolcat',
		
		func: function(args, cmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			var sha = DBot.HashString(cmd);
			var fpath = DBot.WebRoot + '/cowsay/' + sha + '_' + item + '_lolcat.png';
			var fpathU = DBot.URLRoot + '/cowsay/' + sha + '_' + item + '_lolcat.png';
			
			msg.channel.startTyping();
			
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					var result = cowsay.say({
						text: cmd.replace(/`/gi, ''),
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
					var calcWidth = max * size * .6 + 20;
					
					var magikArgs = [
						'-size', calcWidth + 'x' + (size * 1.1),
						'canvas:none',
						'-pointsize', size,
						'-font', font,
						'-gravity', 'NorthWest',
					];
					
					let magikLines = [];
					
					for (let lineNum in splitLines) {
						let lineArg = [];
						magikLines.push(lineArg);
						let line = splitLines[lineNum];
						
						for (let charNum in line) {
							let red = Math.cos(lineNum / charHeight * 3 - charNum / line.length * 2) * 127 + 128;
							let green = Math.sin(charNum / line.length - lineNum / charHeight * 5) * 127 + 128;
							let blue = Math.sin(lineNum / charHeight * 2 - charNum / line.length * 3) * 127 + 128;
							
							lineArg.push('-fill', 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + Math.floor(blue) + ')', '-draw', 'text ' + Math.floor(charNum * size * .6) + ',0 ' + '"' + line[charNum].replace('\\', '\\\\') + '"');
						}
					}
					
					let linesLeft = magikLines.length;
					let BREAK = false;
					
					var continueFunc = function() {
						let outputArgs = [];
						
						for (let line in magikLines) {
							outputArgs.push(DBot.WebRoot + '/cowsay/temp/' + sha + '_' + item + '_lolcat_' + line + '.png');
						}
						
						outputArgs.push('-append', fpath);
						
						let magik = spawn('convert', outputArgs);
						
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
					
					for (let line in magikLines) {
						let newArgs = Util.AppendArrays(Util.CopyArray(magikArgs), magikLines[line]);
						
						newArgs.push(DBot.WebRoot + '/cowsay/temp/' + sha + '_' + item + '_lolcat_' + line + '.png');
						let magik = spawn('convert', newArgs);
						
						Util.Redirect(magik);
						
						magik.on('close', function(code) {
							if (BREAK) {
								return;
							}
							
							if (code == 0) {
								linesLeft--;
								
								if (linesLeft == 0) {
									continueFunc();
								}
							} else {
								msg.channel.stopTyping();
								msg.reply('<internal pony error>');
								BREAK = true;
							}
						});
					}
				}
			});
			
			return true;
		},
	});
});
