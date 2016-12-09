
const fs = require('fs');
const child_process = require('child_process');
const spawn = child_process.spawn;

Util.mkdir(DBot.WebRoot + '/imtmp');

IMagick = {};
Imagick = IMagick;
ImageMagick = IMagick;
ImageMagic = IMagick;
ImageMagik = IMagick;

const Match = /Font: ([^\r\n]+)/;
const MatchGlobal = /Font: ([^\r\n]+)/gi;
const CharsToCheckForSize = '`1234567890-=~!@#$%^&*()_+qwertyuiop[]asdfghjkl\'\\zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:ZXCVBNM<>?|ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮйцукенгшщзхъфывапролджэячсмитьбю"№;';

IMagick.AvaliableFonts = [];
IMagick.PrecacheFonts = [];
IMagick.PrecacheFontsData = {};
IMagick.FontIDs = {};

let SQLInit = false;
let FontsInit = false;

IMagick.PrecacheFont = function(font) {
	if (!FontsInit)
		throw new Error('Call that function in a PrecacheFonts hook!');
	
	if (!IMagick.AvaliableFonts.includes(font))
		throw new Error('No such a font: ' + font + '. If you are a user, you maybe forgot to install it.');
	
	if (IMagick.PrecacheFonts.includes(font))
		return;
	
	IMagick.PrecacheFonts.push(font);
}

let loadingStage3 = function() {
	console.log('Building up fonts sizes, this can take some time when running first time!');
	
	hook.Run('PrecacheFonts');
	
	for (let font of IMagick.PrecacheFonts) {
		Postgres.query('SELECT "CHAR", "WIDTH" FROM font_sizes WHERE "ID" = ' + IMagick.FontIDs[font], function(err, data) {
			if (data && data[0]) {
				IMagick.PrecacheFontsData[font] = {};
				
				for (let row of data) {
					IMagick.PrecacheFontsData[font][row.CHAR.trim()] = Number(row.WIDTH);
				}
				
				return;
			}
			
			let finalQuery = 'BEGIN;';
			let total = 0;
			
			for (let Char of CharsToCheckForSize) {
				total++;
				
				if (Char == '\\')
					Char = '\\\\';
				
				let hash = DBot.HashString(font + '___' + Char);
				let magik = spawn('convert', ['-background', 'none', '-font', font, 'label:' + Char, DBot.WebRoot + '/imtmp/' + hash + '.png']);
				
				magik.on('close', function(code) {
					if (code != 0)
						throw new Error('Stage 3 of Image Magick load failed; CHAR: ' + Char + '; FONT: ' + font);
					
					let magik = spawn('identify', [DBot.WebRoot + '/imtmp/' + hash + '.png']);
					
					let output = '';
					
					magik.stdout.on('data', function(data) {
						output += data.toString();
					});
					
					magik.on('close', function(code) {
						if (code != 0 || output == '')
							throw new Error('Stage 3 of Image Magick load failed');
						
						let parse = output.split(' ');
						let fileName = parse[0];
						let fileType = parse[1];
						let fileSizes = parse[2];
						
						let fileSizesS = fileSizes.split('x');
						let width = Number(fileSizesS[0]);
						let height = Number(fileSizesS[1]);
						let aspectRatio = height / width;
						let aspectRatio2 = width / height;
						
						finalQuery += 'INSERT INTO font_sizes ("ID", "CHAR", "WIDTH") VALUES (\'' + IMagick.FontIDs[font] + '\', ' + Util.escape(Char) + ', \'' + width + '\');';
						total--;
						
						if (total == 0) {
							Postgres.query(finalQuery + 'COMMIT;')
						}
					});
				});
			}
		});
	}
}

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
			
			if (total == 0)
				loadingStage3();
		});
	}
}

hook.Add('SQLInitialize', 'IMagick', function() {
	SQLInit = true;
	
	if (FontsInit)
		loadingStage2();
});

{
	let magik = spawn('convert', ['-list', 'font']);
	
	let output = '';
	
	magik.stdout.on('data', function(data) {
		output += data.toString();
	});
	
	magik.on('close', function(code) {
		if (code != 1) {
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

