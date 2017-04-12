
// 
// Copyright (C) 2017 DBot
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

const spawn = require('child_process').spawn;
const fs = require('fs');
const os = require('os');
const JSON3 = require('json3');
const tmpDir = os.tmpdir().replace(new RegExp('\\\\', 'g'), '/') + '/notdbot_font_precache';
const crypto = require('crypto');

process.env['PATH'] = '../bin;' + process.env['PATH'];

try {
	fs.mkdirSync(tmpDir);
} catch(err) {
	
}

const Match = /Font: ([^\r\n]+)/;
const MatchGlobal = /Font: ([^\r\n]+)/gi;
const toPrecache = JSON3.parse(fs.readFileSync('../resource/imagick_fonts_to_precache.json', 'utf8'));
const avaliable = [];
const fontSizes = [14, 24, 28, 48, 56, 72, 100];
const CharsToCheckForSize = '`1234567890-=~!@#$%^&*()_+qwertyuiop[]asdfghjkl\'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:ZXCVBNM<>?|ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮйцукенгшщзхъфывапролджэячсмитьбю"№;';
const CharsExprStr = '`|1|2|3|4|5|6|7|8|9|0|-|=|~|\\!|@|#|\\$|%|\\^|\\&|\\*|\\(|\\)|_|\\+|q|w|e|r|t|y|u|i|o|p|[|]|a|s|d|f|g|h|j|k|l|\'|z|x|c|v|b|n|m|,|.|/|Q|W|E|R|T|Y|U|I|O|P|{|}|A|S|D|F|G|H|J|K|L|:|Z|X|C|V|B|N|M|<|>|\\?|\\||Й|Ц|У|К|Е|Н|Г|Ш|Щ|З|Х|Ъ|Ф|Ы|В|А|П|Р|О|Л|Д|Ж|Э|Я|Ч|С|М|И|Т|Ь|Б|Ю|й|ц|у|к|е|н|г|ш|щ|з|х|ъ|ф|ы|в|а|п|р|о|л|д|ж|э|я|ч|с|м|и|т|ь|б|ю|"|№|;';

let magik = spawn('convert', ['-list', 'font']);
let output = '';

magik.stdout.on('data', function(data) {
	output += data.toString();
});

magik.on('close', function(code) {
	const matched = output.match(MatchGlobal);

	for (const str of matched) {
		avaliable.push(str.match(Match)[1]);
	}

	console.log('Counted total ' + avaliable.length + ' fonts installed');
	
	const queue = [];
	
	const queueCallback = function() {
		const func = queue[0];
		if (!func) return;
		
		queue.splice(0, 1);
		func();
	};

	for (const font of toPrecache) {
		queue.push(() => {
			if (!avaliable.includes(font)) {
				console.error('FATAL: FONT ' + font + ' IS NOT INSTALLED, OR IMAGEMAGICK IS UNABLE TO FIND IT!');
				process.exit(1);
			}

			const hash = crypto.createHash('sha256').update(font).digest('hex');
			const path = '../resource/fonts_data/' + hash + '.json';

			try {
				if (fs.statSync(path)) {
					console.log(`Font ${font} is ready`);
					queueCallback();
					return;
				}
			} catch(err) {
				console.log(`Processing font ${font}`);

				const magikArgs = ['xc:none', '-background', 'none', '-font', font];

				const emptyName = './empty' + Math.floor(Math.random() * 100000);
				//magikArgs.push(emptyName + '.png');

				try {
					fs.mkdirSync(tmpDir + '/' + hash);
				} catch(err) {

				}

				const fontDir = tmpDir + '/' + hash + '/';

				for (const currentSize of fontSizes) {
					magikArgs.push('-pointsize', currentSize);

					for (const i in CharsToCheckForSize) {
						let Char = CharsToCheckForSize[i];
						
						if (Char === '"')
							magikArgs.push('\'label:"\'', '-write', fontDir + 'size-' + currentSize + '_char-' + i + '.png', '+delete');
						else if (Char === '%')
							magikArgs.push('label:\%', '-write', fontDir + 'size-' + currentSize + '_char-' + i + '.png', '+delete');
						else
							magikArgs.push('"label:' + Char + '"', '-write', fontDir + 'size-' + currentSize + '_char-' + i + '.png', '+delete');
					}
				}

				fs.writeFileSync(tmpDir + '/script-' + hash, magikArgs.join(' '),  err => console.error(err));

				const magik = spawn('magick', ['-script', tmpDir + '/script-' + hash]);

				magik.stdout.pipe(process.stdout);
				magik.stderr.pipe(process.stderr);

				magik.on('close', function(code) {
					if (code !== 0) {
						console.error('FATAL: UNABLE TO PREACHE FONT ' + font);
						process.exit(1);
					}

					const magik = spawn('magick', ['identify', fontDir + '*.png']);
					let output = '';

					magik.stdout.on('data', function(data) {
						output += data.toString();
					});

					magik.stderr.pipe(process.stdout);

					magik.on('close', function(code) {
						if (code !== 0 || output === '') {
							console.error('FATAL: UNABLE TO PREACHE FONT ' + font);
							process.exit(1);
						}

						const newLines = output.replace(/\r/g, '').split('\n');

						const jsonData = {};

						for (const currentSize of fontSizes) {
							jsonData[currentSize] = {};
							jsonData[currentSize].widths = {};
							jsonData[currentSize].height = 0;
						}

						for (const i in newLines) {
							if (newLines[i] === '' || newLines[i] === ' ')
								continue;
							
							const parse = newLines[i].split(' ');
							const fileName = parse[0];
							const fileType = parse[1];
							const fileSizes = parse[2];
							
							let Char = CharsToCheckForSize[Number(fileName.match(/char-([0-9]+)/)[1])];
							let oldChar = Char;
							const currentSize = Number(fileName.match(/size-([0-9]+)/)[1]);

							const fileSizesS = fileSizes.split('x');
							let width = Number(fileSizesS[0]);
							const height = Number(fileSizesS[1]);
							const aspectRatio = height / width;
							const aspectRatio2 = width / height;

							if (oldChar === '\\\\') {
								width = Math.floor(width / 2);
							}

							jsonData[currentSize].widths[oldChar] = width;

							if (Char === 'W')
								jsonData[currentSize].height = height;
						}

						const encoded = JSON3.stringify(jsonData, null, 2);

						fs.writeFile(path, encoded, () => {});
						queueCallback();
					});
				});
			}
		});
	}
	
	queueCallback();
});