
/* global Util, DBot, hook, Postgres */

const fs = require('fs');
const child_process = require('child_process');
const spawn = child_process.spawn;

Util.mkdir(DBot.WebRoot + '/imtmp');
Util.mkdir(DBot.WebRoot + '/textdraw');

IMagick = {};
Imagick = IMagick;
ImageMagick = IMagick;
ImageMagic = IMagick;
ImageMagik = IMagick;

const Match = /Font: ([^\r\n]+)/;
const MatchGlobal = /Font: ([^\r\n]+)/gi;
const CharsToCheckForSize = '`1234567890-=~!@#$%^&*()_+qwertyuiop[]asdfghjkl\'\\zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:ZXCVBNM<>?|ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮйцукенгшщзхъфывапролджэячсмитьбю"№;';
const CharsExprStr = '`|1|2|3|4|5|6|7|8|9|0|-|=|~|\\!|@|#|\\$|%|\\^|\\&|\\*|\\(|\\)|_|\\+|q|w|e|r|t|y|u|i|o|p|[|]|a|s|d|f|g|h|j|k|l|\'|\\|z|x|c|v|b|n|m|,|.|/|Q|W|E|R|T|Y|U|I|O|P|{|}|A|S|D|F|G|H|J|K|L|:|Z|X|C|V|B|N|M|<|>|\\?|\\||Й|Ц|У|К|Е|Н|Г|Ш|Щ|З|Х|Ъ|Ф|Ы|В|А|П|Р|О|Л|Д|Ж|Э|Я|Ч|С|М|И|Т|Ь|Б|Ю|й|ц|у|к|е|н|г|ш|щ|з|х|ъ|ф|ы|в|а|п|р|о|л|д|ж|э|я|ч|с|м|и|т|ь|б|ю|"|№|;';

const CharsExp = new RegExp('(' + CharsExprStr + ')', 'g');
const CharsExp2 = new RegExp('(' + CharsExprStr + '|\n)', 'g');

IMagick.AvaliableFonts = [];
IMagick.PrecacheFonts = [];
IMagick.PrecacheFontsData = {};
IMagick.PrecacheFontsDataHeight = {};
IMagick.FontIDs = {};

let SQLInit = false;
let FontsInit = false;

IMagick.GetTextSize = function(text, font, size) {
	size = size || 12;
	
	if (!font)
		throw new Error('You must specify a font');
	
	if (!IMagick.PrecacheFonts.includes(font))
		throw new Error('Font must be precached: ' + font);
	
	let widths = [0];
	let cLine = 0;
	let mult = size / 14;
	let height = IMagick.PrecacheFontsDataHeight[font] * mult;
	
	text.replace(CharsExp2, function(matched, p1) {
		if (p1 === '\n') {
			height += IMagick.PrecacheFontsDataHeight[font] * mult;
			cLine++;
			widths[cLine] = 0;
			return '';
		}
		
		if (IMagick.PrecacheFontsData[font][p1]) {
			widths[cLine] += IMagick.PrecacheFontsData[font][p1] * mult * .97;
		} else {
			widths[cLine] += IMagick.PrecacheFontsData[font]['W'] * mult * .97;
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
	
	let mult = size / 14;
	let width = (IMagick.PrecacheFontsData[font][Char] || IMagick.PrecacheFontsData[font]['W']) * mult * .95;
	let height = IMagick.PrecacheFontsDataHeight[font] * mult * .9;
	
	return [Math.floor(width), Math.floor(height)];
};

IMagick.GetFontHeight = function(font, size) {
	size = size || 12;
	
	if (!font)
		throw new Error('You must specify a font');
	
	if (!IMagick.PrecacheFonts.includes(font))
		throw new Error('Font must be precached: ' + font);
	
	let height = IMagick.PrecacheFontsDataHeight[font] * (size / 14);
	
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

let loadingStage3 = function() {
	console.log('Building up fonts sizes, this can take some time when running first time!');
	
	hook.Run('PrecacheFonts');
	
	for (let font of IMagick.PrecacheFonts) {
		Postgres.query('SELECT "CHAR", "WIDTH" FROM font_sizes WHERE "ID" = ' + IMagick.FontIDs[font], function(err, data) {
			IMagick.PrecacheFontsData[font] = {};
			IMagick.PrecacheFontsDataHeight[font] = 12;
			
			if (data && data[0]) {
				for (let row of data) {
					let trim = row.CHAR.trim();
					
					if (trim === '')
						trim = ' ';
					
					IMagick.PrecacheFontsData[font][trim.replace('\\\\', '\\')] = Number(row.WIDTH);
				}
				
				Postgres.query('SELECT * FROM font_height WHERE "ID" = ' + IMagick.FontIDs[font], function(_, data) {
					IMagick.PrecacheFontsDataHeight[font] = Number(data[0].HEIGHT);
				});
				
				return;
			}
			
			let finalQuery = 'BEGIN;';
			
			const hash = DBot.HashString(font);
			let magikArgs = ['xc:none', '-background', 'none', '-font', font];
			
			for (let i in CharsToCheckForSize) {
				let Char = CharsToCheckForSize[i];
				let oldChar = Char;
				
				if (Char === '\\')
					Char = '\\\\';
				
				magikArgs.push('label:' + Char, '-write', DBot.WebRoot + '/imtmp/' + hash + '_' + i + '.png', '+delete');
			}
			
			magikArgs.push('empty.png');
			
			let magik = spawn('convert', magikArgs);
			
			Util.Redirect(magik);
			
			magik.on('close', function(code) {
				fs.unlink('empty.png', function() {});
				fs.unlink('empty-0.png', function() {});
				fs.unlink('empty-1.png', function() {});
				
				if (code !== 0)
					throw new Error('Stage 3 of Image Magick load failed; FONT: ' + font);
				
				let magikArgs = [];
				
				for (let i in CharsToCheckForSize)
					magikArgs.push(DBot.WebRoot + '/imtmp/' + hash + '_' + i + '-1.png');
				
				let magik = spawn('identify', magikArgs);
				
				let output = '';
				
				magik.stdout.on('data', function(data) {
					output += data.toString();
				});
				
				magik.stderr.pipe(process.stdout);
				
				magik.on('close', function(code) {
					if (code !== 0 || output === '')
						throw new Error('Stage 3 of Image Magick load failed; Font: ' + font);
					
					let newLines = output.replace(/\r/g, '').split('\n');
					
					for (let i in newLines) {
						let Char = CharsToCheckForSize[i];
						let oldChar = CharsToCheckForSize[i];
						
						if (newLines[i] === '' || newLines[i] === ' ')
							continue;
						
						let parse = newLines[i].split(' ');
						let fileName = parse[0];
						let fileType = parse[1];
						let fileSizes = parse[2];
						
						let fileSizesS = fileSizes.split('x');
						let width = Number(fileSizesS[0]);
						let height = Number(fileSizesS[1]);
						let aspectRatio = height / width;
						let aspectRatio2 = width / height;
						
						if (oldChar === '\\\\') {
							width = Math.floor(width / 2);
						}
						
						finalQuery += 'INSERT INTO font_sizes ("ID", "CHAR", "WIDTH") VALUES (\'' + IMagick.FontIDs[font] + '\', ' + Util.escape(oldChar) + ', \'' + width + '\');';
						
						if (Char === 'W') {
							finalQuery += 'INSERT INTO font_height ("ID", "HEIGHT") VALUES (\'' + IMagick.FontIDs[font] + '\', \'' + height + '\') ON CONFLICT DO NOTHING;';
							IMagick.PrecacheFontsDataHeight[font] = height;
						}
						
						IMagick.PrecacheFontsData[font][oldChar] = width;
					}
					
					Postgres.query(finalQuery + 'COMMIT;');
				});
			});
		});
	}
};

let loadingStage2 = function() {
	let total = 0;
	
	for (let font of IMagick.AvaliableFonts) {
		total++;
		
		Postgres.query('SELECT get_font_id(\'' + font + '\') AS "ID";', function(err, data) {
			if (err) {
				console.error(font);
				throw err;
			}
			
			IMagick.FontIDs[font] = Number(data[0].ID);
			total--;
			
			if (total === 0)
				loadingStage3();
		});
	}
};

hook.Add('SQLInitialize', 'IMagick', function() {
	SQLInit = true;
	if (FontsInit) loadingStage2();
});

{
	let magik = spawn('convert', ['-list', 'font']);
	
	let output = '';
	
	magik.stdout.on('data', function(data) {
		output += data.toString();
	});
	
	magik.on('close', function(code) {
		if (code !== 1) {
			throw new Error('FATAL ERROR: Image Magick closed != 1 code!');
		}
		
		let matched = output.match(MatchGlobal);
		
		for (let str of matched) {
			let font = str.match(Match)[1];
			
			IMagick.AvaliableFonts.push(font);
		}
		
		hook.Run('FontListLoaded', IMagick.AvaliableFonts);
		console.log('Counted total ' + IMagick.AvaliableFonts.length + ' fonts installed');
		
		FontsInit = true;
		if (SQLInit)
			loadingStage2();
	});
}

// Simple text
DrawText = function(text, callback, rFontSize) {
	rFontSize = rFontSize || 48;
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
	
	const sha = DBot.HashString(text + '-FONTSIZE:' + rFontSize + '-FONT:' + font + '-LOLCAT:' + (lolcat && '1' || '0'));
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
				
				let buildDraw = '';
				
				magikArgs.push('-draw');
				
				const height = IMagick.GetFontHeight(font, rFontSize);
				
				for (let i in splitLines) {
					let line = splitLines[i];
					
					buildDraw += ' text 0,' + (i * height) + ' "' + line.replace(/"/g, '\\"').replace(/\\/g, "\\\\") + '"';
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
					
					let magik = spawn('convert', outputArgs);
					
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
					let newArgs = Util.AppendArrays(Util.CopyArray(magikArgs), magikLines[line]);
					
					newArgs.push(DBot.WebRoot + '/textdraw/' + sha + '_tmp_' + line + '.png');
					let magik = spawn('convert', newArgs);
					
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
