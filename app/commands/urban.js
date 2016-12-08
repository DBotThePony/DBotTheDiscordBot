
var unirest = require('unirest');

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
			
			var curr = UnixStamp();
			
			if (!data[0] || data[0].USTAMP < curr) {
				unirest.get("https://mashape-community-urban-dictionary.p.mashape.com/define?term=" + encodeURIComponent(cmd))
				.header("X-Mashape-Key", "EBS2SokObUmshIhkhF080NPpTw4Zp10mx1QjsnSQwZbLG1jWJ9")
				.header("Accept", "text/plain")
				.end(function (result) {
					var first = result.body.list[0];
					
					if (!first) {
						msg.reply('None found');
						return;
					}
					
					var tags = 'Tags: ' + DBot.ConcatArray(result.body.tags, ', ');
					var link = first.permalink;
					var def = first.definition;
					var example = first.example;
					
					msg.reply(tags + '\nDefinition: ' + def + '\nExample: ```' + example + '```');
					
					var q = 'INSERT INTO urbancache ("WORD", "DEFINITION", "TAGS", "ULINK", "DEXAMPLE", "USTAMP") VALUES ('
						+ Util.escape(cmd) + ', '
						+ Util.escape(def) + ', '
						+ Util.escape(tags) + ', '
						+ Util.escape(link) + ', '
						+ Util.escape(example) + ', '
						+ Util.escape(curr + 3600) + ') ON CONFLICT UPDATE SET\
						"WORD" = ' + Util.escape(cmd) + ',\
						"DEFINITION" = ' + Util.escape(def) + ',\
						"TAGS" = ' + Util.escape(tags) + ',\
						"ULINK" = ' + Util.escape(link) + ',\
						"DEXAMPLE" = ' + Util.escape(example) + ', \
						"USTAMP" = ' + Util.escape(curr + 3600);
					
					MySQL.query(q);
				});
			} else {
				var first = data[0];
				var tags = '(cached result)\nTags: ' + first.TAGS;
				var link = first.ULINK;
				var def = first.DEFINITION;
				var example = first.DEXAMPLE;
				
				msg.reply(tags + '\nDefinition: ' + def + '\nExample: ```' + example + '```');
			}
		});
		
	},
}
