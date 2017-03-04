
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

const font = 'Hack-Regular';
const size = 48;

const AvaliableCustomFonts = [
	[font, 'Hack'],
	['Comic-Sans-MS', 'ComicSans'],
	['PricedownBl-Regular', 'GTA'],
	['OptimusPrinceps', 'DarkSouls'],
	['TF2', 'TF2'],
	['BebasNeue', 'ESRB'],
	['Source-Sans-Pro', 'AdobeSans'],
	['Source-Serif-Pro', 'AdobeSerif'],
	['Calibri', 'Calibri'],
	['Times-New-Roman', 'TimesNR'],
	['Open-Sans', 'OpenSans'],
	['Liberation-Mono', 'Liberation'],
	['Liberation-Sans', 'LiberationSans'],
	['Linux-Biolinum-G-Regular', 'Biolinum'],
	['Linux-Libertine-G-Regular', 'Libertine'],
	['Arial', 'Arial'],
	['Impact', 'Impact'],
	['Arimo', 'Arimo'],
	['Cousine', 'Cousine'],
	['Trebuchet-MS', 'Trebuchet'],
	['Roboto', 'Roboto'],
	['Roboto-Mono', 'RobotoMono'],
	['Roboto-Slab-Regular', 'RobotoSlab'],
	['Courier-New', 'Courier'],
	['Time-Normal', 'Time'],
	['Segoe-Print', 'Segoe'],
	['Segoe-Script', 'SegoeScript'],
	['Segoe-UI', 'SegoeUI'],
	
	// Google custom fonts
	
	['Aclonica', 'Aclonica'],
	['Calligraffitti', 'Calligraffitti'],
	['Cherry-Cream-Soda', 'Cherry-Cream-Soda'],
	['Chewy', 'Chewy'],
	['Coming-Soon', 'Coming-Soon'],
	['Crafty-Girls', 'CraftyGirls'],
	['Creepster-Caps-Regular', 'Creepster-Caps'],
	['Crushed', 'Crushed'],
	['Droid-Sans', 'DroidSans'],
	['Droid-Serif', 'DroidSerif'],
	['Fontdiner-Swanky', 'Fontdiner-Swanky'],
	['Homemade-Apple', 'Homemade-Apple'],
	['Irish-Grover', 'Irish-Grover'],
	['Irish-Growler', 'Irish-Growler'],
	['Just-Another-Hand', 'Just-Another-Hand'],
	['Kranky', 'Kranky'],
	['Luckiest-Guy', 'Luckiest-Guy'],
	['Maiden-Orange', 'Maiden-Orange'],
	['Montez', 'Montez'],
	['Mountains-of-Christmas', 'MChristmas'],
	['Permanent-Marker', 'Permanent-Marker'],
	['Rancho', 'Rancho'],
	['Redressed', 'Redressed'],
	['Rochester', 'Rochester'],
	['Rock-Salt', 'Rock-Salt'],
	['Satisfy', 'Satisfy'],
	['Schoolbell', 'Schoolbell'],
	['Slackey', 'Slackey'],
	['Smokum', 'Smokum'],
	['Special-Elite', 'Special-Elite'],
	['Sunshiney', 'Sunshiney'],
	['Syncopate-Regular', 'Syncopate'],
	['Ultra', 'Ultra'],
	['Unkempt', 'Unkempt'],
	['Walter-Turncoat', 'Walter-Turncoat'],
	['Yellowtail', 'Yellowtail'],
	
	// Other Fonts
	
	['Andada', 'Andada'],
	['Andada-SC', 'Andada-SC'],
	['Anonymous-Pro', 'Anonymous'],
	['Anonymous-Pro-Bold', 'Anonymous-Bold'],
	['Anonymous-Pro-Bold-Italic', 'Anonymous-Bold-Italic'],
	['Anonymous-Pro-Italic', 'Anonymous-Italic'],
	['Exo-2-Thin', 'Exo2Thin'],
	['PT-Sans', 'PTSans'],
	['PT-Sans-Bold', 'PTSansBold'],
	['PT-Sans-Bold-Italic', 'PTSansBoldItalic'],
	['PT-Sans-Caption', 'PTSansCaption'],
	['PT-Sans-Caption-Bold', 'PTSansCaptionBold'],
	['PT-Sans-Italic', 'PTSansItalic'],
	['PT-Sans-Narrow', 'PTSansNarrow'],
	['PT-Sans-Narrow-Bold', 'PTSansNarrowBold'],
	['Ubuntu', 'Ubuntu'],
	['Ubuntu-Bold', 'UbuntuBold'],
	['Ubuntu-Bold-Italic', 'UbuntuBoldItalic'],
	['Ubuntu-Condensed', 'UbuntuCondensed'],
	['Ubuntu-Italic', 'UbuntuItalic'],
	['Ubuntu-Light', 'UbuntuLight'],
	['Ubuntu-Light-Italic', 'UbuntuLightItalic'],
	['Ubuntu-Medium', 'UbuntuMedium'],
	['Ubuntu-Medium-Italic', 'UbuntuMediumItalic'],
];

hook.Add('PrecacheFonts', 'DrawCommand', function() {
	IMagick.PrecacheFont(font);
	IMagick.PrecacheFont('Comic-Sans-MS');
	
	for (let row of AvaliableCustomFonts) {
		IMagick.PrecacheFont(row[0]);
	}
});

{
	let squareRoot = Math.ceil(Math.sqrt(AvaliableCustomFonts.length)) * 2;
	let magikArgs = ['-background', 'none', '-fill', 'black', '-gravity', 'NorthWest', '-pointsize', '48', '(', '-size', '600x100%!',];
	let cI = 0;
	
	for (let i in AvaliableCustomFonts) {
		let row = AvaliableCustomFonts[i];
		cI++;
		magikArgs.push('(', '-font', row[0], 'label:' + row[1], ')');
		
		if (cI >= squareRoot) {
			if (i == AvaliableCustomFonts.length)
				magikArgs.push('-append', '-size', '600x100%!', ')');
			else
				magikArgs.push('-append', '-size', '600x100%!', ')', '(');
			
			cI = 0;
		}
	}
	
	if (cI != 0)
		magikArgs.push('-append', '-size', '600x100%!', ')', '+append', DBot.WebRoot + '/drawfonts.png');
	else
		magikArgs.push('+append', DBot.WebRoot + '/drawfonts.png');
	
	let magik = spawn('convert', magikArgs);
	
	magik.stdout.pipe(process.stdout);
	magik.stderr.pipe(process.stdout);
}

Util.mkdir(DBot.WebRoot + '/text', function() {
	Util.mkdir(DBot.WebRoot + '/text/temp');
});

let createFunc = function(font, size, gravity, lolcat) {
	return function(args, cmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		IMagick.DrawText({
			text: cmd,
			font: font,
			size: size,
			lolcat: lolcat,
			gravity: gravity,
		}, function(err, fpath, fpathU) {
			if (err) {
				msg.reply('<internal pony error>');
			} else {
				msg.reply(fpathU);
			}
		});
		
		return true;
	}
}

module.exports = {
	name: 'draw',
	alias: ['text', 'drawtext'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font.',
	argNeeded: true,
	
	func: createFunc(font, size, 'North'),
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

let fnc = function(name, gr) {
	return function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('Font is required. To see all avaliable fonts, use `drawlist`', name, args, 1);
		
		let sFont;
		args[0] = args[0].toLowerCase();
		
		for (let row of AvaliableCustomFonts) {
			if (row[1].toLowerCase() == args[0]) {
				sFont = row[0];
			}
		}
		
		if (!sFont)
			return DBot.CommandError('Invalid font. To see all avaliable fonts, use `drawlist`', name, args, 1);
		
		if (!args[1])
			return DBot.CommandError('Text is required', name, args, 2);
		
		let fCmd;
		
		for (let i = 1; i < args.length; i++) {
			if (fCmd)
				fCmd += ' ' + args[i];
			else
				fCmd = args[i];
		}
		
		IMagick.DrawText({
			text: fCmd,
			font: sFont,
			size: size,
			gravity: gr,
		}, function(err, fpath, fpathU) {
			if (err) {
				msg.reply('<internal pony error>');
			} else {
				msg.reply(fpathU);
			}
		});
		
		return true;
	};
}

DBot.RegisterCommandPipe({
	name: 'drawlist',
	alias: ['drawfonts', 'customfonts', 'drawfontlist'],
	
	help_args: '',
	desc: 'List of avaliable fonts.',
	
	func: function() {
		return DBot.URLRoot + '/drawfonts.png';
	},
});

DBot.RegisterCommandPipe({
	name: 'cdraw',
	alias: ['ctext', 'cdrawtext'],
	
	help_args: '<font> <text>',
	desc: 'Draws a text as image using specified font',
	
	func: fnc('cdraw', 'North'),
});

DBot.RegisterCommandPipe({
	name: 'cndraw',
	alias: ['cntext', 'cndrawtext'],
	
	help_args: '<font> <text>',
	desc: 'Draws a text as image using specified font, Uses North West text align',
	
	func: fnc('cdraw', 'NorthWest'),
});

DBot.RegisterCommandPipe({
	name: 'lolcat',
	alias: ['ltext', 'drawltext', 'ldraw'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour',
	argNeeded: true,
	
	func: createFunc(font, size, 'North', true),
});

DBot.RegisterCommandPipe({
	name: 'nlolcat',
	alias: ['nltext', 'ndrawltext', 'nldraw'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour\nThis uses North West align of text, instead of North',
	argNeeded: true,
	
	func: createFunc(font, size, 'NorthWest', true),
});

DBot.RegisterCommandPipe({
	name: 'comicsans',
	alias: ['sans', 'csans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses COMIC SAAAAAAAAAAAAAAAAANS #$@&&@*&#!',
	argNeeded: true,
	
	func: createFunc('Comic-Sans-MS', size, 'North'),
});

DBot.RegisterCommandPipe({
	name: 'ncomicsans',
	alias: ['nsans', 'ncsans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses COMIC SAAAAAAAAAAAAAAAAANS #$@&&@*&#!\nThis uses North West align of text, instead of North',
	argNeeded: true,
	
	func: createFunc('Comic-Sans-MS', size, 'NorthWest'),
});

DBot.RegisterCommandPipe({
	name: 'lolcomicsans',
	alias: ['lsans', 'lolsans', 'lcomicsans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour',
	argNeeded: true,
	
	func: createFunc('Comic-Sans-MS', size, 'North', true),
});

DBot.RegisterCommandPipe({
	name: 'lolncomicsans',
	alias: ['lnsans', 'lolnsans', 'lncomicsans', 'nlsans', 'nlolsans', 'nlcomicsans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour\nThis uses North West align of text, instead of North',
	argNeeded: true,
	
	func: createFunc('Comic-Sans-MS', size, 'NorthWest', true),
});
