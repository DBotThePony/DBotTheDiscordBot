

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

const fs = require('fs');
const json3 = require('json3');
const child_process = require('child_process');
const spawn = child_process.spawn;

Util.mkdir(DBot.WebRoot + '/killfeed');

const Font = 'TF2';
const FontSize = 42;
const FontSpacing = .5;
const bg = 'rgb(241,233,203)';
const red = 'rgb(163,87,74)';
const blu = 'rgb(85,124,131)';

hook.Add('PrecacheFonts', 'KillIcon', function() {
	IMagick.PrecacheFont(Font);
});

const weaponsData = json3.parse(fs.readFileSync('./resource/killicons_data.json'));

const generateFunc = (col1, col2, cName) => {
	return (args, cmd, msg) => {
		if (!args[0])
			return DBot.CommandError('No user', 'kill', args, 1);
		
		let username = args[0];
		
		if (typeof username === 'object')
			username = username.username;
		
		if (!args[1])
			return DBot.CommandError('No weapon name', 'kill', args, 1);
		
		const weapon = args[1].toLowerCase();
		
		let username2 = args[2];
		
		if (typeof username2 === 'object')
			username2 = username2.username;
		
		let myWeapon = weaponsData[weapon];

		if (!myWeapon) {
			let min = 9999;

			for (const wepClass in weaponsData) {
				if (wepClass.match(weapon) && wepClass.length < min) {
					min = wepClass.length;
					myWeapon = weaponsData[wepClass];
				}
			}
		}

		if (!myWeapon)
			return DBot.CommandError('No such weapon', cName, args, 2);

		let sha = String.hash(username + ' ' + myWeapon.filename + ' ' + username2);
		let fpath = DBot.WebRoot + '/killfeed/' + sha + '.png';
		let fpathU = DBot.URLRoot + '/killfeed/' + sha + '.png';
		
		msg.channel.startTyping();

		fs.stat(fpath, (err, stat) => {
			if (msg.checkAbort()) return;
			
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(fpathU);
				return;
			}
			
			let width = Number(myWeapon.width);
			let iheight = Number(myWeapon.height);
			let height = 70;
			let calcWidthFirst = IMagick.GetTextSize(username, Font, FontSize)[0];
			let calcWidthLast = 0;

			if (username2)
				calcWidthLast = IMagick.GetTextSize(username2, Font, FontSize)[0] + 25;

			let totalWidth = calcWidthFirst + width + calcWidthLast + 30;

			if (!username2)
				totalWidth += 40;

			let magikArgs = [
				'-size', totalWidth + 'x' + height,
				'canvas:' + bg,
				'-font', Font,
				'-pointsize', FontSize,
				'-fill', col1,
				'-weight', '700',
				'-gravity', 'northwest'
			];

			if (username2) {
				magikArgs.push('-draw', 'text 40,20 ' + Postgres.escape(username));
				magikArgs.push('-draw', 'image over ' + (calcWidthFirst + 40) + ',' + (height / 2 - iheight / 2) + ' 0,0 "./resource/killicons/' + myWeapon.filename + '"');
				magikArgs.push('-fill', col2, '-draw', 'text ' + (45 + calcWidthFirst + width) + ',20 ' + Postgres.escape(username2));
			} else {
				magikArgs.push('-draw', 'image over 30,' + (height / 2 - iheight / 2) + ' 0,0 "./resource/killicons/' + myWeapon.filename + '"');
				magikArgs.push('-draw', 'text ' + (60 + width) +',20 ' + Postgres.escape(username));
			}

			magikArgs.push(fpath);

			let magik = spawn('convert', magikArgs);

			Util.Redirect(magik);

			magik.on('close', function(code) {
				if (msg.checkAbort()) return;
				msg.channel.stopTyping();

				if (code !== 0) {
					msg.reply('<internal pony error>');
					return;
				}

				msg.reply(fpathU);
			});
		});
	};
};

module.exports = {
	name: 'kill',
	alias: ['killicon', 'killfeed'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text',
	allowUserArgument: true,
	
	func: generateFunc(red, blu, 'kill')
}

DBot.RegisterCommand({
	name: 'rkill',
	alias: ['rkillicon', 'rkillfeed', 'killiconr', 'killfeedr', 'killr', 'kill_r'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text. Instead of RED / BLU uses BLU / RED',
	allowUserArgument: true,
	
	func: generateFunc(blu, red, 'rkill')
});

DBot.RegisterCommand({
	name: 'tkill',
	alias: ['tkillicon', 'tkillfeed', 'killicont', 'killfeedt', 'killt', 'kill_t'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text. TEAM KILLER!',
	allowUserArgument: true,
	
	func: generateFunc(red, red, 'tkill')
});

DBot.RegisterCommand({
	name: 'rtkill',
	alias: ['rtkillicon', 'rtkillfeed', 'rkillicont', 'rkillfeedt', 'killrt', 'kill_rt', 'trkillicon', 'trkillfeed', 'rkillicont', 'rkillfeedt', 'killtr', 'kill_tr'],
	
	help_args: '<user 1 (@User or text)> <weapon> [User2]',
	desc: 'Generates TF2 kill text. BLU TEAM KILLER!',
	allowUserArgument: true,
	
	func: generateFunc(blu, blu, 'rtkill')
});
