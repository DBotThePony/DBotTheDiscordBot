
/* global DBot, Util, Postgres */

if (!DBot.cfg.google_enable) return;

const unirest = DBot.js.unirest;

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
			
			try {
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
				
				let output = 'Title: ' + result.title;
				
				if (isCached) {
					output = '(results are cached)\n' + output;
				}
				
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
						
						let output = [];
						const uid = data.seek().id;
						let i = 0;
						
						for (const item of result.body.items) {
							i++;
							output.push(`(${uid}, ${Postgres.escape(i)}, ${Postgres.escape(item.title || 'No title avaliable')}, ${Postgres.escape(item.snippet || 'No data avaliable')}, ${Postgres.escape(item.link || 'No link avaliable')})`);
						}
						
						Postgres.query(`DELETE FROM google_search_results WHERE id = ${uid}; INSERT INTO google_search_results VALUES ${output.join(',')};`);

						continueSearch(result.body.items);
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
