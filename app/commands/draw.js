
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

let createFunc = function(font, size, gravity, lolcat) {
	return function(args, cmd, msg) {
		if (cmd.length > 8000)
			return 'wtf are you doing?';
		
		IMagick.DrawText({
			text: cmd,
			font: font,
			size: size,
			lolcat: lolcat,
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
	
	func: createFunc(font, size, 'Center', true),
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
	
	func: createFunc('Comic-Sans-MS', size, 'Center'),
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
	
	func: createFunc('Comic-Sans-MS', size, 'Center', true),
});

DBot.RegisterCommandPipe({
	name: 'lolncomicsans',
	alias: ['lnsans', 'lolnsans', 'lncomicsans', 'nlsans', 'nlolsans', 'nlcomicsans'],
	
	help_args: '<text>',
	desc: 'Draws a text as image. Uses Hack font. Also applies lolcat-like behaviour\nThis uses North West align of text, instead of North',
	argNeeded: true,
	
	func: createFunc('Comic-Sans-MS', size, 'NorthWest', true),
});
