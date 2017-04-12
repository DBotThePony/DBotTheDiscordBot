

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

myGlobals.__RateCooldowns = myGlobals.__RateCooldowns || {};

const hDuration = require('humanize-duration');
const moment = require('moment');
const fs = require('fs');
const emoji = require('../lib/emoji.js');

Util.mkdir(DBot.WebRoot + '/ratings');
Util.SafeCopy('./resource/files/emojione.sprites.css', DBot.WebRoot + '/emojione.sprites.css');
Util.SafeCopy('./resource/files/emojione.sprites.png', DBot.WebRoot + '/emojione.sprites.png');

module.exports = {
	name: 'rate',
	
	help_args: '<user> <reaction>',
	desc: 'Gives a emoji to a user',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;-;';

		if (myGlobals.__RateCooldowns[msg.author.id] > CurTime())
			return 'Cooldown! Wait ' + hDuration(Math.floor(myGlobals.__RateCooldowns[msg.author.id] - CurTime()) * 1000);
		
		if (typeof args[0] !== 'object')
			return DBot.CommandError('Must be user', 'rate', args, 1);
		
		if (args[0].id === msg.author.id)
			return DBot.CommandError('lonely', 'rate', args, 1);
		
		if (!args[1])
			return DBot.CommandError('No emoji', 'rate', args, 2);
		
		const findEmoji = emoji.spliceString(args[1]);
		
		if (!findEmoji)
			return DBot.CommandError('No emoji!' + (args[1].match(emoji.customRegExp) && ' Also, nu custom emoji is allowed ;w;' || ''), 'rate', args, 2);
		
		myGlobals.__RateCooldowns[msg.author.id] = CurTime() + 180;
		const em = findEmoji[0];
		msg.channel.startTyping();
		const vals = `${sql.User(msg.author)}, ${sql.User(args[0])}, ${sql.Server(msg.channel.guild)}, get_emoji('${em}')`;
		
		Postgres.query(`SELECT give_emoji_simple(${vals}) AS "RESULT"`, (err, data) => {
			if (err) {
				msg.channel.stopTyping();
				msg.reply('<Internal pone error>');
				console.error(err);
				return;
			}
			
			msg.channel.stopTyping();
			msg.reply(`Left a emoji rating. He got ${data[0].RESULT} of them now ^-^`);
		});
	}
};

DBot.RegisterCommand({
	name: 'rates',
	alias: ['ratings'],
	
	help_args: '[user]',
	desc: 'User ratings',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let target;
		let userName;
		const pm = DBot.IsPM(msg);
		
		if (pm)
			target = msg.author;
		else if (!pm && typeof args[0] === 'object')
			if (msg.channel.guild.member(args[0]))
				target = msg.channel.guild.member(args[0]);
			else
				target = msg.member;
		else if (!pm && typeof args[0] !== 'object')
			target = msg.member;
		
		msg.channel.startTyping();
		
		const sha = String.hash(CurTime() + 'ratings_' + msg.author.id + target.id);
		const path = DBot.WebRoot + '/ratings/' + sha + '.html';
		const pathU = DBot.URLRoot + '/ratings/' + sha + '.html';
		
		userName = target.nickname || target.username || target.user.username;

		Postgres.query(`SELECT reactions."COUNT", emoji_ids."UNICODE", emoji_ids."EMOJI_NAME" FROM reactions, emoji_ids WHERE emoji_ids."ID" = reactions."EMOJI" AND reactions."USER" = ${sql.User(target.user || target)}`, (err, dataHist) => {
			const dataRender = [];

			for (const row of dataHist) {
				dataRender.push({
					id: row.UNICODE,
					count: row.COUNT,
					name: `:${row.EMOJI_NAME}:`
				});
			}

			msg.channel.stopTyping();

			if (dataRender.length > 0) {
				fs.writeFile(path, DBot.pugRender('ratings.pug', {
					data: dataRender,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: userName,
					server: 'N/A',
					title: 'User Ratings'
				}), console.errHandler);

				msg.reply(pathU);
			} else {
				msg.reply('No ratings to list ;-;');
			}
		});
	}
});