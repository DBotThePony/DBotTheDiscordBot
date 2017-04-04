
// TO-DO - Separate font precache part into standalone script

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
const CharsToCheckForSize = '`1234567890-=~!@#$%^&*()_+qwertyuiop[]asdfghjkl\'\\zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:ZXCVBNM<>?|ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮйцукенгшщзхъфывапролджэячсмитьбю"№;';
const CharsExprStr = '`|1|2|3|4|5|6|7|8|9|0|-|=|~|\\!|@|#|\\$|%|\\^|\\&|\\*|\\(|\\)|_|\\+|q|w|e|r|t|y|u|i|o|p|[|]|a|s|d|f|g|h|j|k|l|\'|\\|z|x|c|v|b|n|m|,|.|/|Q|W|E|R|T|Y|U|I|O|P|{|}|A|S|D|F|G|H|J|K|L|:|Z|X|C|V|B|N|M|<|>|\\?|\\||Й|Ц|У|К|Е|Н|Г|Ш|Щ|З|Х|Ъ|Ф|Ы|В|А|П|Р|О|Л|Д|Ж|Э|Я|Ч|С|М|И|Т|Ь|Б|Ю|й|ц|у|к|е|н|г|ш|щ|з|х|ъ|ф|ы|в|а|п|р|о|л|д|ж|э|я|ч|с|м|и|т|ь|б|ю|"|№|;';

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
	
	if (!IMagick.AvaliableFonts.includes(font))
		throw new Error('No such a font: ' + font + '. If you are a user, you maybe forgot to install it.');
	
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

		const queue = [];
		let next = 0;

		const queueCallback = function() {
			if (hasFinished)
				return;

			let currentFunc = queue[next];
			next++;

			if (currentFunc) {
				currentFunc();
			} else {
				console.log('Fonts data is loaded');
				hasFinished = true;
			}
		};

		for (let font of IMagick.PrecacheFonts) {
			for (const currentSize of fontSizes) {
				const hash = String.hash(font + '_' + currentSize);
				const path = './resource/fonts_data/' + hash + '.json';
				
				queue.push(() => {
					IMagick.PrecacheFontsData[font] = IMagick.PrecacheFontsData[font] || {};
					IMagick.PrecacheFontsData[font][currentSize] = IMagick.PrecacheFontsData[font][currentSize] || {};

					let cTab = IMagick.PrecacheFontsData[font][currentSize];

					IMagick.PrecacheFontsDataHeight[font] = IMagick.PrecacheFontsDataHeight[font] || {};
					IMagick.PrecacheFontsDataHeight[font][currentSize] = 12;
					
					fs.stat(path, (err, stat) => {
						if (stat) {
							fs.readFile(path, {encoding: 'utf8'}, (err, readData) => {
								const data = JSON3.parse(readData);
								
								for (const char in data.widths) {
									const width = data.widths[char];
									let trim = char.trim();

									if (trim === '')
										trim = ' ';

									cTab[trim.replace('\\\\', '\\')] = Number(width);
								}
								
								IMagick.PrecacheFontsDataHeight[font][currentSize] = Number(data.height);
								queueCallback();
							});
						} else {
							console.log(`Precaching font ${font} with pointsize ${currentSize}`);
							const magikArgs = ['xc:none', '-background', 'none', '-font', font, '-pointsize', currentSize];

							for (const i in CharsToCheckForSize) {
								let Char = CharsToCheckForSize[i];
								const oldChar = Char;

								if (Char === '\\')
									Char = '\\\\';

								magikArgs.push('label:' + Char, '-write', DBot.WebRoot + '/imtmp/' + hash + '_' + i + '.png', '+delete');
							}

							magikArgs.push('empty.png');

							const magik = spawn('convert', magikArgs);

							Util.Redirect(magik);

							magik.on('close', function(code) {
								fs.unlink('empty.png', function() {});
								fs.unlink('empty-0.png', function() {});
								fs.unlink('empty-1.png', function() {});

								if (code !== 0) throw new Error('Stage 3 of Image Magick load failed; FONT: ' + font);

								const magikArgs = [];
								const unlinkArgs = [];

								for (const i in CharsToCheckForSize) {
									magikArgs.push(DBot.WebRoot + '/imtmp/' + hash + '_' + i + '-1.png');
									unlinkArgs.push(DBot.WebRoot + '/imtmp/' + hash + '_' + i + '-0.png');
									unlinkArgs.push(DBot.WebRoot + '/imtmp/' + hash + '_' + i + '-1.png');
								}

								const magik = spawn('identify', magikArgs);
								let output = '';

								magik.stdout.on('data', function(data) {
									output += data.toString();
								});

								magik.stderr.pipe(process.stdout);

								magik.on('close', function(code) {
									if (code !== 0 || output === '')
										throw new Error('Stage 3 of Image Magick load failed; Font: ' + font);

									const newLines = output.replace(/\r/g, '').split('\n');
									
									const jsonData = {};
									jsonData.widths = {};
									jsonData.height = 0;

									for (let i in newLines) {
										let Char = CharsToCheckForSize[i];
										let oldChar = CharsToCheckForSize[i];

										if (newLines[i] === '' || newLines[i] === ' ')
											continue;

										const parse = newLines[i].split(' ');
										const fileName = parse[0];
										const fileType = parse[1];
										const fileSizes = parse[2];

										const fileSizesS = fileSizes.split('x');
										let width = Number(fileSizesS[0]);
										const height = Number(fileSizesS[1]);
										const aspectRatio = height / width;
										const aspectRatio2 = width / height;

										if (oldChar === '\\\\') {
											width = Math.floor(width / 2);
										}

										jsonData.widths[oldChar] = width;
										
										if (Char === 'W') {
											IMagick.PrecacheFontsDataHeight[font][currentSize] = height;
											jsonData.height = height;
										}

										cTab[oldChar] = width;
									}
									
									const encoded = JSON3.stringify(jsonData);
									
									fs.writeFile(path, encoded, console.callback());

									for (const f of unlinkArgs)
										fs.unlink(f, err => {if (err) console.log(err);});

									queueCallback();
								});
							});
						}
					});
				});
			}
		}

		for (let i = 1; i <= os.cpus().length; i++) {
			queueCallback();
		}
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
						currentBuild = 'text 0,' + (i * height) + ' "' + line.replace(/"/g, '\\"').replace(/\\/g, "\\\\") + '"';
					else
						currentBuild += ' text 0,' + (i * height) + ' "' + line.replace(/"/g, '\\"').replace(/\\/g, "\\\\") + '"';
					
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
					magik = spawn('convert', magikArgs);
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
