
// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

'use strict';

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const fs = require('fs');
const JSON3 = require('json3');
const child_process = require('child_process');
const spawn = child_process.spawn;
const os = require('os');

Util.mkdir(DBot.WebRoot + '/imtmp', function() {
	Util.truncate(DBot.WebRoot + '/imtmp');
});

Util.mkdir(DBot.WebRoot + '/textdraw');

const Match = /Font: ([^\r\n]+)/;
const MatchGlobal = /Font: ([^\r\n]+)/gi;
const CharsToCheckForSize = '`1234567890-=~!@#$%^&*()_+qwertyuiop[]asdfghjkl\'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:ZXCVBNM<>?|ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮйцукенгшщзхъфывапролджэячсмитьбю"№;';
const CharsExprStr = '`|1|2|3|4|5|6|7|8|9|0|-|=|~|\\!|@|#|\\$|%|\\^|\\&|\\*|\\(|\\)|_|\\+|q|w|e|r|t|y|u|i|o|p|[|]|a|s|d|f|g|h|j|k|l|\'|z|x|c|v|b|n|m|,|.|/|Q|W|E|R|T|Y|U|I|O|P|{|}|A|S|D|F|G|H|J|K|L|:|Z|X|C|V|B|N|M|<|>|\\?|\\||Й|Ц|У|К|Е|Н|Г|Ш|Щ|З|Х|Ъ|Ф|Ы|В|А|П|Р|О|Л|Д|Ж|Э|Я|Ч|С|М|И|Т|Ь|Б|Ю|й|ц|у|к|е|н|г|ш|щ|з|х|ъ|ф|ы|в|а|п|р|о|л|д|ж|э|я|ч|с|м|и|т|ь|б|ю|"|№|;';

const CharsExp = new RegExp('(' + CharsExprStr + ')', 'g');
const CharsExp2 = new RegExp('(' + CharsExprStr + '|\n)', 'g');
const fontSizes = [14, 24, 28, 48, 56, 72, 100];

IMagick.AvaliableFonts = [];
IMagick.PrecacheFonts = IMagick.PrecacheFonts || [];
IMagick.PrecacheFontsData = IMagick.PrecacheFontsData || {};
IMagick.PrecacheFontsDataHeight = IMagick.PrecacheFontsDataHeight || {};

let SQLInit = false;
let FontsInit = false;

const findNearestSize = function(size) {
	let min = 999;
	let nearest = 100;
	
	for (const s of fontSizes) {
		const delta = Math.abs(size - s);
		if (delta < min) {
			nearest = s;
			min = delta;
		}
	}
	
	return nearest;
};

IMagick.findNearestSize = findNearestSize;

IMagick.GetTextSize = function(text, font, size) {
	size = size || 12;
	
	if (!font)
		throw new Error('You must specify a font');
	
	if (!IMagick.PrecacheFonts.includes(font))
		throw new Error('Font must be precached: ' + font);
	
	const nearest = findNearestSize(size);
	const cHeightTab = IMagick.PrecacheFontsDataHeight[font][nearest];
	const cWidthTab = IMagick.PrecacheFontsData[font][nearest];
	
	let widths = [0];
	let cLine = 0;
	const mult = size / nearest;
	let height = cHeightTab * mult;
	
	text.replace(CharsExp2, function(matched, p1) {
		if (p1 === '\n') {
			height += cHeightTab * mult;
			cLine++;
			widths[cLine] = 0;
			return '';
		}
		
		if (cWidthTab[p1]) {
			widths[cLine] += cWidthTab[p1] * mult * .97;
		} else {
			widths[cLine] += cWidthTab['W'] * mult * .97;
		}
		
		return '';
	});
	
	let width = 0;
	
	for (let w of widths) {
		if (width < w)
			width = w;
	}
	
	return [Math.floor(width), Math.floor(height)];
};

IMagick.GetCharSize = function(Char, font, size) {
	size = size || 12;
	
	if (!font)
		throw new Error('You must specify a font');
	
	if (!IMagick.PrecacheFonts.includes(font))
		throw new Error('Font must be precached: ' + font);
	
	const nearest = findNearestSize(size);
	const cHeightTab = IMagick.PrecacheFontsDataHeight[font][nearest];
	const cWidthTab = IMagick.PrecacheFontsData[font][nearest];
	const mult = size / nearest;
	const width = (cWidthTab[Char] || cWidthTab['W']) * mult * .95;
	const height = cHeightTab * mult * .9;
	
	return [Math.floor(width), Math.floor(height)];
};

IMagick.GetFontHeight = function(font, size) {
	size = size || 12;
	
	if (!font)
		throw new Error('You must specify a font');
	
	if (!IMagick.PrecacheFonts.includes(font))
		throw new Error('Font must be precached: ' + font);
	
	const nearest = findNearestSize(size);
	const cHeightTab = IMagick.PrecacheFontsDataHeight[font][nearest];
	const cWidthTab = IMagick.PrecacheFontsData[font][nearest];
	const mult = size / nearest;
	const height = cHeightTab * mult * .9;
	
	return Math.floor(height);
};

IMagick.PrecacheFont = function(font) {
	if (!FontsInit)
		throw new Error('Call that function in a PrecacheFonts hook!');
	
	//if (!IMagick.AvaliableFonts.includes(font))
	//	throw new Error('No such a font: ' + font + '. If you are a user, you maybe forgot to install it.');
	
	if (IMagick.PrecacheFonts.includes(font))
		return;
	
	IMagick.PrecacheFonts.push(font);
};

let hasFinished = false;

if (!IMagick.FONTS_LOADED) {
	let magik = spawn('convert', ['-list', 'font']);
	
	let output = '';
	
	magik.stdout.on('data', function(data) {
		output += data.toString();
	});
	
	magik.on('close', function(code) {
		const matched = output.match(MatchGlobal);
		
		for (const str of matched) {
			IMagick.AvaliableFonts.push(str.match(Match)[1]);
		}
		
		hook.Run('FontListLoaded', IMagick.AvaliableFonts);
		console.log('Counted total ' + IMagick.AvaliableFonts.length + ' fonts installed');
		console.log('Loading font data');
		
		FontsInit = true;
		hook.Run('PrecacheFonts');
		
		fs.writeFile('./resource/imagick_fonts_to_precache.json', JSON3.stringify(IMagick.PrecacheFonts), (err) => {if (err) console.error(err);});

		for (const font of IMagick.PrecacheFonts) {
			if (!IMagick.AvaliableFonts.includes(font)) {
				console.error('No such a font: ' + font + '. Font is not installed.');
				process.exit(1);
			}
		}

		for (const font of IMagick.PrecacheFonts) {
			const hash = String.hash(font);
			const path = './resource/fonts_data/' + hash + '.json';
			
			try {
				fs.statSync(path);
			} catch(err) {
				console.error('FATAL: UNABLE TO LOAD FONT DATA FOR ' + font + ' AND SIZE ' + currentSize + '! Run precache script and try again.');
				// process.exit(1);
				continue;
			}
			
			const data = JSON3.parse(fs.readFileSync(path, {encoding: 'utf8'}));

			IMagick.PrecacheFontsData[font] = IMagick.PrecacheFontsData[font] || {};
			IMagick.PrecacheFontsDataHeight[font] = IMagick.PrecacheFontsDataHeight[font] || {};
			
			for (const currentSize in data) {
				IMagick.PrecacheFontsData[font][currentSize] = IMagick.PrecacheFontsData[font][currentSize] || {};
				IMagick.PrecacheFontsDataHeight[font][currentSize] = Number(data[currentSize].height);
				
				const cTab = IMagick.PrecacheFontsData[font][currentSize];
				
				for (const char in data[currentSize].widths) {
					const width = data[currentSize].widths[char];
					let trim = char.trim();

					if (trim === '')
						trim = ' ';

					cTab[trim.replace('\\\\', '\\')] = Number(width);
				}
			}
		}
		
		console.log('Loaded font data');
	});
}

// Simple text
IMagick.DrawSimpleText = function(text, callback, rFontSize) {
	rFontSize = rFontSize || 48;
	let splitLines = text.replace(/\t/gi, '    ').split('\n');
	
	let max = 0;
	
	for (let i in splitLines) {
		if (splitLines[i].length > max)
			max = splitLines[i].length;
	}
	
	let sha = String.hash(text + '------FONTSIZE:' + rFontSize);
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
				'-font', 'Hack-Regular',
				'-gravity', 'NorthWest',
				'-fill', 'black'
			];
			
			let buildDraw = '';
			
			magikArgs.push('-draw');
			
			for (let i in splitLines) {
				const line = splitLines[i];
				
				buildDraw += ' text 0,' + (i * rFontSize * 1.5) + ' "' + line.replace(/"/g, '\\"').replace(/\\/g, "\\\\") + '"';
			}
			
			magikArgs.push(buildDraw);
			
			magikArgs.push(fpath);
			
			let magik = spawn('convert', magikArgs);
			
			Util.Redirect(magik);
			
			magik.on('close', function(code) {
				if (code === 0) {
					callback(null, fpath, fpathU);
				} else {
					callback(code);
				}
			});
		}
	});
};

// Advanced text
IMagick.DrawText = function(data, callback) {
	let text = data.text || '';
	let rFontSize = data.size || 48;
	let font = data.font || 'Hack-Regular';
	let gravity = (data.gravity || 'NorthWest').toLowerCase();
	let lolcat = data.lolcat;
	
	if (!IMagick.PrecacheFonts.includes(font))
		throw new Error('Font must be precached: ' + font);
	
	let splitLines = text.replace(/\t/gi, '    ').split('\n');
	
	let max = 0;
	
	for (let i in splitLines) {
		if (splitLines[i].length > max)
			max = splitLines[i].length;
	}
	
	const sha = String.hash(text + '-FONTSIZE:' + rFontSize + '-FONT:' + font + '-LOLCAT:' + (lolcat && '1' || '0'));
	const fpath = DBot.WebRoot + '/textdraw/' + sha + '.png';
	const fpathU = DBot.URLRoot + '/textdraw/' + sha + '.png';
	
	fs.stat(fpath, function(err, stat) {
		if (stat) {
			callback(null, fpath, fpathU);
		} else {
			let calcData = IMagick.GetTextSize(text, font, rFontSize);
			let calcHeight = calcData[1];
			let calcWidth = calcData[0] + 20;
			
			if (!lolcat) {
				let magikArgs = [
					'convert',
					'-size', calcWidth + 'x' + calcHeight,
					'canvas:none',
					'-pointsize', rFontSize,
					'-font', font,
					'-gravity', gravity,
					'-fill', 'black'
				];
				
				magikArgs.push('-draw');
				
				const height = IMagick.GetFontHeight(font, rFontSize);
				let currentBuild = null;
				
				for (const i in splitLines) {
					const line = splitLines[i];
					
					if (currentBuild === null)
						currentBuild = 'text 0,' + (i * height) + ' "' + line.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
					else
						currentBuild += ' text 0,' + (i * height) + ' "' + line.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
					
					if (currentBuild.length > 800) {
						magikArgs.push(currentBuild);
						currentBuild = null;
					}
				}
				
				if (currentBuild !== '' && currentBuild !== null)
					magikArgs.push(currentBuild);
				
				magikArgs.push(fpath);
				
				let magik;
					
				try {
					magik = spawn('magick', magikArgs);
				} catch(err) {
					console.error(err);
					callback(127, err);
					return;
				}
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code === 0) {
						callback(null, fpath, fpathU);
					} else {
						callback(code);
					}
				});
			} else {
				let magikArgs = [
					'-size', calcWidth + 'x' + IMagick.GetFontHeight(font, rFontSize),
					'canvas:none',
					'-pointsize', rFontSize,
					'-font', font,
					'-gravity', gravity
				];
				
				let magikLines = [];
				
				for (let lineNum in splitLines) {
					let lineArg = [];
					magikLines.push(lineArg);
					let line = splitLines[lineNum];
					let charHeight = IMagick.GetFontHeight(font, rFontSize);
					let previousLength = 0;
					let calcLineWidth = 0;
					
					if (gravity === 'center' || gravity === 'south' || gravity === 'north') {
						calcLineWidth = IMagick.GetTextSize(line, font, rFontSize)[0];
					}
					
					for (let charNum in line) {
						let red = Math.cos(lineNum / charHeight * 3 - charNum / line.length * 2) * 127 + 128;
						let green = Math.sin(charNum / line.length - lineNum / charHeight * 5) * 127 + 128;
						let blue = Math.sin(lineNum / charHeight * 2 - charNum / line.length * 3) * 127 + 128;
						
						lineArg.push('-fill', 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + Math.floor(blue) + ')', '-draw');
						let charWidth = IMagick.GetCharSize(line[charNum], font, rFontSize)[0];
						let chr = line[charNum];
						
						if (chr === '\\') {
							chr = '\\\\';
						}
						
						if (gravity === 'center' || gravity === 'south' || gravity === 'north') {
							lineArg.push(
								'text ' + Math.floor(previousLength + charWidth - calcLineWidth / 2) + ',0 ' + '"' + chr + '"'
							);
						} else {
							lineArg.push(
								'text ' + Math.floor(previousLength + charWidth) + ',0 ' + '"' + chr + '"'
							);
						}
						
						previousLength += charWidth;
					}
				}
				
				let linesLeft = magikLines.length;
				let BREAK = false;
				
				const continueFunc = function() {
					let outputArgs = [];
					
					for (let line in magikLines) {
						outputArgs.push(DBot.WebRoot + '/textdraw/' + sha + '_tmp_' + line + '.png');
					}
					
					outputArgs.push('-append', fpath);
					let magik;
					
					try {
						magik = spawn('convert', outputArgs);
					} catch(err) {
						console.error(err);
						callback(127, err);
						return;
					}
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						for (let line in magikLines) {
							fs.unlink(DBot.WebRoot + '/textdraw/' + sha + '_tmp_' + line + '.png', function(err) {
								// If no file were created, don't crash app
							});
						}
						
						if (code === 0) {
							callback(null, fpath, fpathU);
						} else {
							callback(code);
						}
					});
				};
				
				for (let line in magikLines) {
					let newArgs = Array.Append(Array.Copy(magikArgs), magikLines[line]);
					
					newArgs.push(DBot.WebRoot + '/textdraw/' + sha + '_tmp_' + line + '.png');
					
					let magik;
					
					try {
						magik = spawn('convert', newArgs);
					} catch(err) {
						console.error(err);
						callback(127, err);
						return;
					}
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (BREAK) {
							return;
						}
						
						if (code === 0) {
							linesLeft--;
							
							if (linesLeft === 0) {
								continueFunc();
							}
						} else {
							console.log(newArgs);
							callback(code);
							BREAK = true;
							return;
						}
					});
				}
			}
		}
	});
};

IMagick.GetInfo = function(path, callback) {
	let magik = spawn('identify', [path]);
	
	let output = '';
	let outputErr = '';
	
	magik.stderr.on('data', function(data) {
		outputErr += data.toString();
	});
	
	magik.stdout.on('data', function(data) {
		output += data.toString();
	});
	
	magik.on('close', function(code) {
		if (code === 0 && output !== '') {
			const parse = output.split(' ');
			
			const fileName = parse[0];
			const fileType = parse[1];
			const fileSizes = parse[2];
			
			const fileSizesS = fileSizes.split('x');
			const width = Number(fileSizesS[0]);
			const height = Number(fileSizesS[1]);
			const aspectRatio = height / width;
			const aspectRatio2 = width / height;
			
			callback(null, fileType, width, height, aspectRatio, aspectRatio2);
		} else {
			callback(outputErr, null, null, null, null, null);
		}
	});
};

IMagick.Identify = IMagick.GetInfo;

IMagick.MonospaceText = function(x, y, text, size, spaceMult) {
	let reply = '';
	
	for (let i in text) {
		let Char = text[i];
		
		if (Char === '\\')
			Char = '\\\\';
		
		if (Char === '"')
			Char = '\\"';
		
		reply += ' text ' + (x + i * size * spaceMult) + ',' + y + ' "' + Char + '"';
	}
	
	return reply;
};
