
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

const font = 'Hack-Regular';
const size = 48;
const cowsay = require('cowsay');

hook.Add('PrecacheFonts', 'CowSay', function() {
	IMagick.PrecacheFont(font);
});

Util.mkdir(DBot.WebRoot + '/cowsay', function() {
	Util.mkdir(DBot.WebRoot + '/cowsay/temp');
});

var cows = [
	'cow',
	'tux',
	'sheep',
	'www',
	'dragon',
	'vader',
];

for (let item of cows) {
	DBot.RegisterCommandPipe({
		id: item + 'say',
		name: item + 'say',
		alias: [item],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Say TEH word',
		
		func: function(args, cmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			var result = cowsay.say({
				text: cmd.replace(/```/gi, ''),
				f: ask,
			});
			
			return '```' + result + '```';
		},
	});
	
	DBot.RegisterCommandPipe({
		id: 'i' + item + 'say',
		name: 'i' + item + 'say',
		alias: ['i' + item],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Renders TEH word as image',
		
		func: function(args, cmd, msg) {
			let ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			let result = cowsay.say({
				text: cmd.replace(/```/gi, ''),
				f: ask,
			});
			
			msg.channel.startTyping();
			
			IMagick.DrawText({
				text: result,
				font: font,
				size: size,
				gravity: 'NorthWest',
			}, function(err, fpath, fpathU) {
				msg.channel.stopTyping();
				
				if (err) {
					msg.reply('<internal pony error>');
				} else {
					msg.reply(fpathU);
				}
			})
			
			return true;
		},
	});
	
	DBot.RegisterCommandPipe({
		id: 'l' + item + 'say',
		name: 'l' + item + 'say',
		alias: ['l' + item, 'lol' + item, 'lol' + item + 'say'],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Renders TEH word as image + lolcat',
		
		func: function(args, cmd, msg) {
			var ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			let result = cowsay.say({
				text: cmd.replace(/```/gi, ''),
				f: ask,
			});
			
			msg.channel.startTyping();
			
			IMagick.DrawText({
				text: result,
				font: font,
				size: size,
				gravity: 'NorthWest',
				lolcat: true,
			}, function(err, fpath, fpathU) {
				msg.channel.stopTyping();
				
				if (err) {
					msg.reply('<internal pony error>');
				} else {
					msg.reply(fpathU);
				}
			})
		},
	});
}
