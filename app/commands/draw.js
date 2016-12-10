
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

var font = 'Hack-Regular';
var size = 48;

hook.Add('PrecacheFonts', 'DrawCommand', function() {
	IMagick.PrecacheFont(font);
	IMagick.PrecacheFont('Comic-Sans-MS');
});

Util.mkdir(DBot.WebRoot + '/text', function() {
	Util.mkdir(DBot.WebRoot + '/text/temp');
});

let createFunc = function(font, size, gravity) {
	return function(args, cmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		IMagick.DrawText({
			text: cmd,
			font: font,
			size: size,
			gravity: 'Center',
		}, function(err, fpath, fpathU) {
			if (err) {
				msg.reply('<internal pony error>');
			} else {
				msg.reply(fpathU);
			}
		})
		
		return true;
	}
}

module.exports = {
	name: 'draw',
	alias: ['text', 'drawtext'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font.',
	argNeeded: true,
	
	func: createFunc(font, size, 'Center'),
}

DBot.RegisterPipe(module.exports);

DBot.RegisterCommandPipe({
	name: 'ndraw',
	alias: ['ntext', 'ndrawtext'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font.\nThis uses North West align of text, instead of North',
	argNeeded: true,
	
	func: createFunc(font, size, 'NorthWest'),
});

DBot.RegisterCommandPipe({
	name: 'lolcat',
	alias: ['ltext', 'drawltext', 'ldraw'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour',
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_lolcat.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_lolcat.png';
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.channel.stopTyping();
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
				var calcWidth = max * size * .6 + 30;
				
				var magikArgs = [
					'-size', calcWidth + 'x' + (size * 1.5),
					'canvas:none',
					'-pointsize', size,
					'-font', font,
					'-gravity', 'Center',
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
						
						lineArg.push('-fill', 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + Math.floor(blue) + ')', '-draw', 'text ' + Math.floor((charNum - line.length / 2) * size * .6 + 15) + ',0 ' + '"' + line[charNum].replace('\\', '\\\\') + '"');
					}
				}
				
				let linesLeft = magikLines.length;
				let BREAK = false;
				
				var continueFunc = function() {
					let outputArgs = [];
					
					for (let line in magikLines) {
						outputArgs.push(DBot.WebRoot + '/text/temp/' + sha + '_lolcat_' + line + '.png');
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
					
					newArgs.push(DBot.WebRoot + '/text/temp/' + sha + '_lolcat_' + line + '.png');
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
	}
});

DBot.RegisterCommandPipe({
	name: 'nlolcat',
	alias: ['nltext', 'ndrawltext', 'nldraw'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour\nThis uses North West align of text, instead of North',
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_lolcat_nw.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_lolcat_nw.png';
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.channel.stopTyping();
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
				var calcWidth = max * size * .6 + 20;
				
				var magikArgs = [
					'-size', calcWidth + 'x' + (size * 1.5),
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
						
						lineArg.push('-fill', 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + Math.floor(blue) + ')', '-draw', 'text ' + (charNum * size * .6 + 10) + ',0 ' + '"' + line[charNum].replace('\\', '\\\\') + '"');
					}
				}
				
				let linesLeft = magikLines.length;
				let BREAK = false;
				
				var continueFunc = function() {
					let outputArgs = [];
					
					for (let line in magikLines) {
						outputArgs.push(DBot.WebRoot + '/text/temp/' + sha + '_lolcat_' + line + '.png');
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
					
					newArgs.push(DBot.WebRoot + '/text/temp/' + sha + '_lolcat_' + line + '.png');
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
	}
});

DBot.RegisterCommandPipe({
	name: 'comicsans',
	alias: ['sans', 'csans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses COMIC SAAAAAAAAAAAAAAAAANS #$@&&@*&#!',
	argNeeded: true,
	
	func: function(args, cmd, msg) {
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
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.channel.stopTyping();
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
				
				let buildDraw = '';
				
				magikArgs.push('-draw');
				
				for (var i in splitLines) {
					var line = splitLines[i];
					
					buildDraw += ' text 0,' + (i * size * 1.5) + ' "' + line.replace(/"/g, "'").replace(/\\/g, "\\\\") + '"';
				}
				
				magikArgs.push(buildDraw);
				
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
	}
});

DBot.RegisterCommandPipe({
	name: 'ncomicsans',
	alias: ['nsans', 'ncsans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses COMIC SAAAAAAAAAAAAAAAAANS #$@&&@*&#!\nThis uses North West align of text, instead of North',
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (cmd.length > 8000)
			return 'Too big!';
		
		var splitLines = cmd.split('\n');
		
		var max = 0;
		
		for (var i in splitLines) {
			if (splitLines[i].length > max)
				max = splitLines[i].length;
		}
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_s_nw.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_s_nw.png';
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(fpathU);
			} else {
				var calcHeight = splitLines.length * size * 1.5;
				var calcWidth = max * size * .6 + 20;
				
				var magikArgs = [
					'-size', calcWidth + 'x' + calcHeight,
					'canvas:none',
					'-pointsize', size,
					'-font', 'Comic-Sans-MS',
					'-gravity', 'NorthWest',
					'-fill', 'black',
				];
				
				for (var i in splitLines) {
					var line = splitLines[i];
					
					magikArgs.push('-draw', 'text 0,' + (i * size * 1.5) + ' "' + line.replace(/"/g, "'").replace(/\\/g, "\\\\") + '"');
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
	}
});

DBot.RegisterCommandPipe({
	name: 'lolcomicsans',
	alias: ['lsans', 'lolsans', 'lcomicsans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour',
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_lolcat_s.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_lolcat_s.png';
		
		msg.channel.startTyping();
		
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
				var calcWidth = max * size * .6 + 40;
				
				var magikArgs = [
					'-size', calcWidth + 'x' + (size * 1.5),
					'canvas:none',
					'-pointsize', size,
					'-font', 'Comic-Sans-MS',
					'-gravity', 'Center',
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
						
						lineArg.push('-fill', 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + Math.floor(blue) + ')', '-draw', 'text ' + Math.floor((charNum - line.length / 2) * size * .6) + ',0 ' + '"' + line[charNum].replace('\\', '\\\\') + '"');
					}
				}
				
				let linesLeft = magikLines.length;
				let BREAK = false;
				
				var continueFunc = function() {
					let outputArgs = [];
					
					for (let line in magikLines) {
						outputArgs.push(DBot.WebRoot + '/text/temp/' + sha + '_lolcat_' + line + '.png');
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
					
					newArgs.push(DBot.WebRoot + '/text/temp/' + sha + '_lolcat_' + line + '.png');
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
	}
});

DBot.RegisterCommandPipe({
	name: 'lolncomicsans',
	alias: ['lnsans', 'lolnsans', 'lncomicsans', 'nlsans', 'nlolsans', 'nlcomicsans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour\nThis uses North West align of text, instead of North',
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/text/' + sha + '_lolcat_s_nw.png';
		var fpathU = DBot.URLRoot + '/text/' + sha + '_lolcat_s_nw.png';
		
		msg.channel.startTyping();
		
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
				var calcWidth = max * size * .6 + 30;
				
				var magikArgs = [
					'-size', calcWidth + 'x' + (size * 1.5),
					'canvas:none',
					'-pointsize', size,
					'-font', 'Comic-Sans-MS',
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
						
						lineArg.push('-fill', 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + Math.floor(blue) + ')', '-draw', 'text ' + (charNum * size * .6 + 10) + ',0 ' + '"' + line[charNum].replace('\\', '\\\\') + '"');
					}
				}
				
				let linesLeft = magikLines.length;
				let BREAK = false;
				
				var continueFunc = function() {
					let outputArgs = [];
					
					for (let line in magikLines) {
						outputArgs.push(DBot.WebRoot + '/text/temp/' + sha + '_lolcat_' + line + '.png');
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
					
					newArgs.push(DBot.WebRoot + '/text/temp/' + sha + '_lolcat_' + line + '.png');
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
	}
});
