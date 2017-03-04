
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

if (!DBot.cfg.google_enable) return;

const unirest = DBot.js.unirest;
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
		
		if (!(msg.channel.name || 'private').match('nsfw')) {
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
			
			let items2;
			
			if (!previousStuff)
				items2 = items;
			else {
				items2 = [];
				
				for (let i2 in items) {
					let hit = false;
					
					for (let i in previousStuff) {
						if (previousStuff[i] === items[i2].link) {
							hit = true;
							break;
						}
					}
					
					if (!hit)
						items2.push(items[i2]);
				}
			}
			
			if (!items2[0]) {
				msg.reply('Onoh! No more results ;n;');
				return;
			}
			
			let result;
			
			if (previousStuff)
				result = Array.Random(items2);
			else
				result = items2[0];
			
			let output = '<' + result.contextLink + '>\n' + result.link;
			
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
