
const unirest = DBot.js.unirest;

module.exports = {
	name: 'urban',
	
	argNeeded: true,
	failMessage: 'Word required',
	delay: 4,
	
	help_args: '<phrase>',
	desc: 'Get a definition of word',
	
	func: function(args, cmd, msg) {
		MySQL.query('SELECT * FROM urbancache WHERE WORD = ' + Util.escape(cmd), function(err, data) {
			if (err)
				return;
			
			let curr = UnixStamp();
			
			if (!data[0] || data[0].USTAMP < curr) {
				unirest.get("https://mashape-community-urban-dictionary.p.mashape.com/define?term=" + encodeURIComponent(cmd))
				.header("X-Mashape-Key", "EBS2SokObUmshIhkhF080NPpTw4Zp10mx1QjsnSQwZbLG1jWJ9")
				.header("Accept", "text/plain")
				.end(function (result) {
					let first = result.body.list[0];
					
					if (!first) {
						msg.reply('None found');
						return;
					}
					
					let tags = 'Tags: ' + DBot.ConcatArray(result.body.tags, ', ');
					let link = first.permalink;
					let def = first.definition;
					let example = first.example;
					
					msg.reply(tags + '\nDefinition: ' + def + '\nExample: ```' + example + '```');
					
					let q = 'INSERT INTO urbancache ("WORD", "DEFINITION", "TAGS", "ULINK", "DEXAMPLE", "USTAMP") VALUES ('
						+ Util.escape(cmd) + ', '
						+ Util.escape(def) + ', '
						+ Util.escape(tags) + ', '
						+ Util.escape(link) + ', '
						+ Util.escape(example) + ', '
						+ Util.escape(curr + 3600) + ') ON CONFLICT ("WORD") DO UPDATE SET\
						"WORD" = ' + Util.escape(cmd) + ',\
						"DEFINITION" = ' + Util.escape(def) + ',\
						"TAGS" = ' + Util.escape(tags) + ',\
						"ULINK" = ' + Util.escape(link) + ',\
						"DEXAMPLE" = ' + Util.escape(example) + ', \
						"USTAMP" = ' + Util.escape(curr + 3600);
					
					MySQL.query(q);
				});
			} else {
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
