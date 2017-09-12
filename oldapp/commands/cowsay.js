

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
const cowsay = require('cowsay');

hook.Add('PrecacheFonts', 'CowSay', function() {
	IMagick.PrecacheFont(font);
});

Util.mkdir(DBot.WebRoot + '/cowsay', function() {
	Util.mkdir(DBot.WebRoot + '/cowsay/temp');
});

const cows = [
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
			let ask = item;
			
			if (item == 'cow')
				ask = 'default';
			
			let result = cowsay.say({
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
				lolcat: true,
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
}
