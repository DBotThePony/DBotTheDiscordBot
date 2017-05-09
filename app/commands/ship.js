

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
const fs = require('fs');
const spawn = child_process.spawn;

Util.mkdir(`${DBot.WebRoot}/ship`);

module.exports = {
	name: 'ship',
	
	help_args: '[user1] [user2]',
	desc: 'https://www.trixiebooru.org/search?q=shipping',
	allowUserArgument: true,
	delay: 0,
	
	func: function(args, cmd, msg) {
		if (!args[0] || typeof args[0] !== 'object')
			return DBot.CommandError('Invalid user', 'ship', args, 1);
		if (!args[1] || typeof args[1] !== 'object')
			return DBot.CommandError('Invalid user', 'ship', args, 2);

		const user1 = args[0];
		const user2 = args[1];
		const avatar1 = user1.avatarURL;
		const avatar2 = user2.avatarURL;

		if (user1.id === user2.id)
			return DBot.CommandError('what', 'ship', args, 2);

		if (!avatar1)
			return DBot.CommandError('User has no avatar', 'ship', args, 1);
		if (!avatar2)
			return DBot.CommandError('User has no avatar', 'ship', args, 2);

		let nick1;
		let nick2;

		if (this.server) {
			const member1 = this.server.member(user1);
			const member2 = this.server.member(user2);

			if (!member1)
				return DBot.CommandError('Invalid user', 'ship', args, 1);
			if (!member2)
				return DBot.CommandError('Invalid user', 'ship', args, 2);

			nick1 = member1.nickname || user1.username;
			nick2 = member2.nickname || user2.username;
		} else {
			nick1 = user1.username;
			nick2 = user2.username;
		}

		const nick1Sub = Math.max(Math.floor(nick1.length / 2), 4);
		const nick2Sub = Math.min(Math.floor(nick2.length / 2), nick1Sub);
		const nick1Piece = nick1.substr(0, nick1Sub);
		const nick2Piece = nick2.substr(nick2Sub);

		const sha = String.hash(nick1 + nick2 + avatar1 + avatar2);
		const pPath = `${DBot.WebRoot}/ship/${sha}.png`;
		const uPath = `${DBot.URLRoot}/ship/${sha}.png`;

		msg.channel.startTyping();

		CommandHelper.loadImage(avatar1, (avatarP1) => {
			CommandHelper.loadImage(avatar2, (avatarP2) => {
				fs.stat(pPath, (err, stat) => {
					if (!stat) {
						const magikArgs = [
							'(', avatarP1, '-resize', '512', ')',
							'(', './resource/emoji/2665.png', '-resize', '512', ')',
							'(', avatarP2, '-resize', '512', ')',
							'+append',
							pPath
						];

						const magik = spawn('convert', magikArgs);
						magik.stderr.pipe(process.stderr);
						magik.stdout.pipe(process.stdout);

						magik.on('close', (code) => {
							msg.channel.stopTyping();

							if (code === 1) {
								msg.reply('I broke! uh oh ;n;');
							} else {
								const text = `${this.author} ships it\nShip name: **${nick1Piece}${nick2Piece}**\n${uPath}`;
								msg.sendMessage(text);
							}
						});
					} else {
						msg.channel.stopTyping();
						const text = `${this.author} ships it\nShip name: **${nick1Piece}${nick2Piece}**\n${uPath}`;
						msg.sendMessage(text);
					}
				});
			}, (result) => {
				msg.channel.stopTyping();
				msg.reply('Failed to download image. `HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '` URL: ' + urlStrings[i]);
			});
		}, (result) => {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. `HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '` URL: ' + urlStrings[i]);
		});
	}
};