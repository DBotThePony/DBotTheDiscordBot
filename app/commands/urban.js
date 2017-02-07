
if (!DBot.cfg.urban_enable) return;

const unirest = DBot.js.unirest;

module.exports = {
	name: 'urban',
	
	argNeeded: true,
	failMessage: 'Word required',
	delay: 4,
	
	help_args: '<phrase>',
	desc: 'Get a definition of word',
	
	func: function(args, cmd, msg) {
		msg.channel.startTyping();
		
		MySQL.query('SELECT * FROM urbancache WHERE "WORD" = ' + Util.escape(cmd), function(err, data) {
			let curr = UnixStamp();
			
			if (!data[0] || data[0].USTAMP < curr) {
				unirest.get("https://mashape-community-urban-dictionary.p.mashape.com/define?term=" + encodeURIComponent(cmd))
				.header("X-Mashape-Key", DBot.cfg.urban)
				.header("Accept", "text/plain")
				.end(function (result) {
					let first = result.body.list[0];
					
					if (!first) {
						msg.reply('None found');
						return;
					}
					
					let tags = 'Tags: ' + result.body.tags.join(', ');
					let link = first.permalink;
					let def = first.definition;
					let example = first.example;
					
					if (def.length > 700) {
						def = def.substr(0, 700) + ' <...>';
					}
					
					
					if (example.length > 1000) {
						example = example.substr(0, 1000) + ' <...>';
					}
					
					msg.channel.stopTyping();
					msg.reply(tags + '\nDefinition: ' + def + '\nExample: ```' + example + '```');
					
					let q = 'INSERT INTO urbancache ("WORD", "DEFINITION", "TAGS", "ULINK", "DEXAMPLE", "USTAMP") VALUES ('
						+ Util.escape(cmd) + ', '
						+ Util.escape(def) + ', '
						+ Util.escape(tags) + ', '
						+ Util.escape(link) + ', '
						+ Util.escape(example) + ', '
						+ Util.escape(curr + 3600) + ') ON CONFLICT ("WORD") DO UPDATE SET\
						"WORD" = excluded."WORD",\
						"DEFINITION" = excluded."DEFINITION",\
						"TAGS" = excluded."TAGS",\
						"ULINK" = excluded."ULINK",\
						"DEXAMPLE" = excluded."DEXAMPLE", \
						"USTAMP" = excluded."USTAMP"';
					
					MySQL.query(q);
				});
			} else {
				msg.channel.stopTyping();
				
				let first = data[0];
				let tags = '(cached result)\nTags: ' + first.TAGS;
				let link = first.ULINK;
				let def = first.DEFINITION;
				let example = first.DEXAMPLE;
				
				msg.reply(tags + '\nDefinition: ' + def + '\nExample: ```' + example + '```');
			}
		});
		
	},
}
