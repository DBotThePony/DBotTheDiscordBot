

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
const CommandHelper = myGlobals.CommandHelper;

const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

const font = 'Hack-Regular';
const size = 48;

Util.mkdir(DBot.WebRoot + '/text', function() {
	Util.mkdir(DBot.WebRoot + '/text/temp')
});

const figlet = require('figlet');
const fonts = figlet.fontsSync();
const wrappedList = Util.WrapText(fonts.join(', '));

for (let i in fonts) {
	fonts[i] = fonts[i].toLowerCase();
}

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
	name: 'cascii',
	alias: ['cfiglet', 'cifiglet', 'icfiglet'],
	
	help_args: '<font> <phrase> ...',
	desc: 'Turn chars into ASCII art as image\nUses figlet library\nYou must specify font there',
	
	func: function(args, cmd, msg) {
		let Font = args[0];
		
		if (!Font)
			return DBot.CommandError('Missing font', 'cascii', args, 1);
		
		Font = Font.toLowerCase();
		if (!fonts.includes(Font))
			return DBot.CommandError('Invalid font', 'cascii', args, 1);
		
		if (!args[0])
			return DBot.CommandError('Missing phrase', 'cascii', args, 2);
		
		let ncmd = cmd.substr(Font.length);
		
		if (ncmd.length > 400)
			return 'You wot';
		
		figlet.text(ncmd, {
			kerning: 'full',
			font: Font,
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
	name: 'clascii',
	alias: ['clfiglet', 'clfiglet', 'lcfiglet'],
	
	help_args: '<font> <phrase> ...',
	desc: 'Turn chars into ASCII art as image\nUses figlet library\nYou must specify font there\nApplies lolcat',
	
	func: function(args, cmd, msg) {
		let Font = args[0];
		
		if (!Font)
			return DBot.CommandError('Missing font', 'cascii', args, 1);
		
		Font = Font.toLowerCase();
		if (!fonts.includes(Font))
			return DBot.CommandError('Invalid font', 'cascii', args, 1);
		
		if (!args[0])
			return DBot.CommandError('Missing phrase', 'cascii', args, 2);
		
		let ncmd = cmd.substr(Font.length);
		
		if (ncmd.length > 400)
			return 'You wot';
		
		figlet.text(ncmd, {
			kerning: 'full',
			font: Font,
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

DBot.RegisterCommand({
	name: 'fontlist',
	alias: ['figletlist', 'listfiglet', 'figletfonts', 'figletfont'],
	
	help_args: '',
	desc: 'Lists avaliable figlet fonts',
	
	func: function(args, cmd, msg) {
		IMagick.DrawText({
			text: wrappedList,
		}, function(err, fpath, fpathU) {
			if (err) {
				msg.reply('<internal pony error>');
			} else {
				msg.reply(fpathU);
			}
		});
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

