
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

const font = 'Hack-Regular';
const size = 48;

Util.mkdir(DBot.WebRoot + '/text', function() {
	Util.mkdir(DBot.WebRoot + '/text/temp')
});

const figlet = require('figlet');

module.exports = {
	name: 'ascii',
	alias: ['figlet'],
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase> ...',
	desc: 'Turn chars into ASCII art\nUses figlet library',
	
	func: function(args, cmd, msg) {
		if (cmd.length > 30)
			return 'Too big!';
		
		figlet.text(cmd, {
			kerning: 'full',
		}, function(err, data) {
			if (err) {
				msg.reply('<internal pony error>')
				return;
			}
			
			msg.reply('```' + data + '```');
		});
	},
}

DBot.RegisterCommandPipe({
	name: 'iascii',
	alias: ['ifiglet'],
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase> ...',
	desc: 'Turn chars into ASCII art as image\nUses figlet library',
	
	func: function(args, cmd, msg) {
		if (cmd.length > 400)
			return 'You wot';
		
		figlet.text(cmd, {
			kerning: 'full',
		}, function(err, result) {
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
			});
		});
		
		return true;
	}
});

DBot.RegisterCommandPipe({
	name: 'lascii',
	alias: ['lolascii', 'lolcatascii', 'lfiglet', 'lolfiglet', 'lifiglet'],
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase> ...',
	desc: 'Turn chars into ASCII art as image\nUses figlet library\nAlso applies lolcat',
	
	func: function(args, cmd, msg) {
		if (cmd.length > 400)
			return 'You wot';
		
		figlet.text(cmd, {
			kerning: 'full',
		}, function(err, result) {
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
			});
		});
		
		return true;
	}
});

