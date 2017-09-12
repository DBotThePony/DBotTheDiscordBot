

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

if (!DBot.cfg.google_enable) return;

const unirest = require('unirest');
const Search = 'https://www.googleapis.com/customsearch/v1?key=' + DBot.cfg.google + '&cx=011142896060985630711:sibr51l3m7a&safe=medium&searchType=image&q=';

module.exports = {
	name: 'image',
	alias: ['gimage', 'im', 'img', 'i'],
	
	argNeeded: true,
	delay: 3,
	more: true,
	
	help_args: '<phrase>',
	desc: 'Search an image in google',
	
	func: function(args, cmd, msg, previousStuff) {
		let enc = encodeURIComponent(cmd.toLowerCase());
		let url = Search + enc;
		let hash = String.hash(enc);
		
		let ServerTags;
		let ClientTags = DBot.UserTags(msg.author, 'google');
		let ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'google');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'google');
		}
		
		if (!DBot.channelIsNSFW(msg.channel)) {
			for (let k in args) {
				let split = args[k].split(' ');
				
				for (let i in split) {
					if (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i])) {
						return 'Search string contains tags that was banned by server, client or even you ;n;';
					}
				}
			}
		}
		
		msg.channel.startTyping();
		
		const continueSearch = function(items, isCached) {
			if (msg.checkAbort()) return;
			msg.channel.stopTyping();
			
			if (!items || !items[0])
				return msg.reply('None found ;n;');
			
			const items2 = [];

			for (const i2 of items) {
				if (!previousStuff.includes(i2.link)) items2.push(i2);
			}

			if (!items2[0]) {
				msg.reply('Onoh! No more results ;n;');
				return;
			}
			
			const result = Array.Random(items2);
			let output = '<' + result.contextLink + '>\n' + result.link;
			previousStuff.push(result.link);
			
			if (isCached) {
				output = '(results are cached)\n' + output;
			}
			
			msg.reply(output);
		};
		
		Postgres.query(`SELECT google_picture_results.* FROM google_picture, google_picture_results WHERE "phrase" = '${hash}' AND google_picture_results."id" = google_picture."id" AND "stamp" > currtime() - 3600 ORDER BY "order" ASC`, function(err, data) {
			if (err) throw err;
			const getFunc = function() {
				unirest.get(url)
				.end(function(result) {
					if (msg.checkAbort()) return;
					if (!result.body) {
						msg.channel.stopTyping();
						msg.reply('wtf with google');
						return;
					}
					
					Postgres.query(`INSERT INTO google_picture ("phrase", "stamp") VALUES ('${hash}', currtime()) ON CONFLICT (phrase) DO UPDATE SET stamp = currtime() RETURNING id`, function(err, data) {
						data.throw();
						
						if (!result.body.items) {
							msg.channel.stopTyping();
							msg.reply('wtf with google');
							return;
						}
						
						try {
							let output = [];
							const uid = data.seek().id;
							let i = 0;

							for (const item of result.body.items) {
								i++;
								item.contextLink = item.image.contextLink;
								output.push(`(${uid}, ${Postgres.escape(item.title || 'No title avaliable')}, ${Postgres.escape(item.snippet || 'No data avaliable')}, ${Postgres.escape(item.link || 'No link avaliable')}, ${Postgres.escape(item.image.contextLink || 'No link avaliable')}, ${i})`);
							}

							Postgres.query(`INSERT INTO google_picture_results VALUES ${output.join(',')} ON CONFLICT ("id", "order") DO UPDATE SET title = excluded.title, snippet = excluded.snippet, link = excluded.link, "contextLink" = excluded."contextLink";`);

							continueSearch(result.body.items);
						} catch(err) {
							msg.channel.stopTyping();
							msg.reply('wtf with google');
						}
					});
				});
			};
			
			if (data.empty(getFunc)) return;
			continueSearch(data.rawRows);
		});
	}
};
