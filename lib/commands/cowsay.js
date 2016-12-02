
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
	DBot.RegisterCommand({
		id: item + 'say',
		name: item + 'say',
		alias: [item],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Say TEH word',
		
		func: function(args, cmd, rawcmd, msg) {
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
	
	DBot.RegisterCommand({
		id: 'i' + item + 'say',
		name: 'i' + item + 'say',
		alias: ['i' + item],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Renders TEH word as image',
		
		func: function(args, cmd, rawcmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
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
			
			var sha = DBot.HashString(result);
			var fpath = DBot.WebRoot + '/cowsay/' + sha + '_' + item + '.png';
			var fpathU = DBot.URLRoot + '/cowsay/' + sha + '_' + item + '.png';
			
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.reply(fpathU);
				} else {
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
		},
	});
});
