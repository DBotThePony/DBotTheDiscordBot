
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

const font = 'Hack-Regular';
const size = 48;

Util.mkdir(DBot.WebRoot + '/textdraw');

DrawText = function(text, callback, rFontSize) {
	rFontSize = rFontSize || size;
	let splitLines = text.replace(/\t/gi, '    ').split('\n');
	
	let max = 0;
	
	for (let i in splitLines) {
		if (splitLines[i].length > max)
			max = splitLines[i].length;
	}
	
	let sha = DBot.HashString(text + '------FONTSIZE:' + rFontSize);
	let fpath = DBot.WebRoot + '/textdraw/' + sha + '.png';
	let fpathU = DBot.URLRoot + '/textdraw/' + sha + '.png';
	
	fs.stat(fpath, function(err, stat) {
		if (stat) {
			callback(null, fpath, fpathU);
		} else {
			let calcHeight = splitLines.length * rFontSize * 1.5;
			let calcWidth = max * rFontSize * .6 + 20;
			
			let magikArgs = [
				'-size', calcWidth + 'x' + calcHeight,
				'canvas:none',
				'-pointsize', rFontSize,
				'-font', font,
				'-gravity', 'NorthWest',
				'-fill', 'black',
			];
			
			let buildDraw = '';
			
			magikArgs.push('-draw');
			
			for (let i in splitLines) {
				let line = splitLines[i];
				
				buildDraw += ' text 0,' + (i * rFontSize * 1.5) + ' "' + line.replace(/"/g, '\\"').replace(/\\/g, "\\\\") + '"';
			}
			
			magikArgs.push(buildDraw);
			
			magikArgs.push(fpath);
			
			let magik = spawn('convert', magikArgs);
			
			Util.Redirect(magik);
			
			magik.on('close', function(code) {
				if (code == 0) {
					callback(null, fpath, fpathU);
				} else {
					callback(code);
				}
			});
		}
	});
}