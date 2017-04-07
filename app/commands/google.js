

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

if (!DBot.cfg.google_enable) return;

const unirest = require('unirest');

const Search = 'https://www.googleapis.com/customsearch/v1?key=' + DBot.cfg.google + '&cx=011142896060985630711:sibr51l3m7a&safe=medium&q=';

DBot.CreateTagsSpace('google', [
	'fuck',
	'dick',
	'fap',
	'port',
	'cock',
	'ass',
	'assfuck',
	'fucking',
	'pron',
	'shit',
	'anal',
	'hentai',
	'ecchi',
	'echi',
	'scum',
	'r34',
	'rule34',
	'pornhub'
]);

let fn = function(prefix) {
	return function(args, cmd, msg, previousStuff) {
		let enc = encodeURIComponent(prefix + cmd.toLowerCase());
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
			
			try {
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
				let output = 'Title: ' + result.title;
				
				previousStuff.push(result.link);
				
				if (isCached)
					output = '(results are cached)\n' + output;
				
				output += '\n```' + result.snippet + '```\n' + result.link;
				
				msg.reply(output);
			} catch(err) {
				msg.reply('<internal pony error>');
				console.error(err);
			}
		};
		
		Postgres.query(`SELECT google_search_results.* FROM google_search, google_search_results WHERE "phrase" = '${hash}' AND google_search_results."id" = google_search."id" AND "stamp" > currtime() - 3600 ORDER BY "order" ASC`, function(err, data) {
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
					
					Postgres.query(`INSERT INTO google_search ("phrase", "stamp") VALUES ('${hash}', currtime()) ON CONFLICT (phrase) DO UPDATE SET stamp = currtime() RETURNING id`, function(err, data) {
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
								output.push(`(${uid}, ${Postgres.escape(i)}, ${Postgres.escape(item.title || 'No title avaliable')}, ${Postgres.escape(item.snippet || 'No data avaliable')}, ${Postgres.escape(item.link || 'No link avaliable')})`);
							}

							Postgres.query(`DELETE FROM google_search_results WHERE id = ${uid}; INSERT INTO google_search_results VALUES ${output.join(',')};`);

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
	};
};

module.exports = {
	name: 'google',
	alias: ['search', 'g'],
	
	argNeeded: true,
	delay: 3,
	more: true,
	
	help_args: '<phrase>',
	desc: 'Search a site in google',
	
	func: fn('')
};

DBot.RegisterCommand({
	name: 'wiki',
	alias: ['wikipedia'],
	
	argNeeded: true,
	delay: 3,
	more: true,
	
	help_args: '<phrase>',
	desc: 'Search stuff in Wikipedia.\nThis uses Google tag ban space.',
	
	func: fn('site:wikipedia.org ')
});

DBot.RegisterCommand({
	name: 'youtube',
	alias: ['ytube'],
	
	argNeeded: true,
	delay: 3,
	more: true,
	
	help_args: '<phrase>',
	desc: 'Search stuff in YouTube.\nThis uses Google tag ban space.',
	
	func: fn('site:youtube.com ')
});
