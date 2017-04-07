

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

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const hDuration = require('humanize-duration');
const moment = require('moment');
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/comments');

module.exports = {
	name: 'comment',
	alias: ['commentary'],
	
	help_args: '<user> [commentary]',
	desc: 'Puts a commentary under user comment history',
	allowUserArgument: true,
	delay: 10,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Whos you gonna comment in PM? Me? ;-; oh';

		if (typeof args[0] !== 'object')
			return DBot.CommandError('Must be user', 'comment', args, 1);
		
		if (args[0].id === msg.author.id)
			return DBot.CommandError('lonely', 'comment', args, 1);
		
		msg.channel.startTyping();
		
		let reason;
		
		for (let i = 1; i < args.length; i++) {
			if (!args[i]) break;
			if (reason)
				reason += ' ' + args[i];
			else
				reason = args[i];
		}
		
		if (!reason || reason === '')
			return DBot.CommandError('nice commentary', 'comment', args, 2);
		
		Postgres.query(`INSERT INTO commentaries("USER","COMMENTATOR","COMMENT") VALUES(${sql.User(args[0])},${sql.User(msg.author)},${Postgres.escape(reason)})`, (err, data) => {
			if (err) {
				msg.channel.stopTyping();
				msg.reply('<Internal pone error>');
				console.error(err);
				return;
			}
			
			msg.channel.stopTyping();
			msg.reply(`Left a commentary`);
		});
	}
};

const replaceRegExp = new RegExp('(https?://[^ ]+)', 'gi');

DBot.RegisterCommand({
	name: 'comments',
	alias: ['commentaries'],
	
	help_args: '[user]',
	desc: 'User commentaries',
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
		
		const sha = String.hash(CurTime() + 'comments_' + msg.author.id + target.id);
		const path = DBot.WebRoot + '/comments/' + sha + '.html';
		const pathU = DBot.URLRoot + '/comments/' + sha + '.html';
		
		userName = target.nickname || target.username || target.user.username;

		Postgres.query(`SELECT commentaries.*, users."NAME" as "username", users."UID" as "uid" FROM commentaries, users WHERE "USER" = ${sql.User(target)} AND users."ID" = commentaries."COMMENTATOR" ORDER BY "STAMP" DESC LIMIT 300`, (err, dataHist) => {
			const dataRender = [];

			for (const row of dataHist) {
				dataRender.push({
					username: row.username,
					userid: row.uid,
					comm: row.COMMENT.replace(/<>&/gi, '').replace(replaceRegExp, '<a href="$1" target="_blank">$1</a>'),
					date: Util.formatStamp(row.STAMP)
				});
			}

			msg.channel.stopTyping();

			if (dataRender.length > 0) {
				fs.writeFile(path, DBot.pugRender('comments.pug', {
					data: dataRender,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: userName,
					server: 'N/A',
					title: 'Commentaries'
				}), console.errHandler);

				msg.reply(pathU);
			} else {
				msg.reply('No commentaries to list ;-;');
			}
		});
	}
});