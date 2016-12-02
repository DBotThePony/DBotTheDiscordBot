
var unirest = require('unirest');

DBot.DefineMySQLTable('urbancache', 'WORD VARCHAR(64) NOT NULL PRIMARY KEY, DEFINITION TEXT NOT NULL, TAGS VARCHAR(512) NOT NULL, ULINK VARCHAR(64) NOT NULL, DEXAMPLE TEXT NOT NULL, USTAMP INTEGER NOT NULL');

module.exports = {
	name: 'urban',
	
	argNeeded: true,
	failMessage: 'Word required',
	delay: 4,
	
	help_args: '<phrase>',
	desc: 'Get a definition of word',
	
	func: function(args, cmd, msg) {
		DBot.query('SELECT * FROM urbancache WHERE WORD = ' + DBot.MySQL.escape(cmd), function(err, data) {
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
					
					var q = 'REPLACE INTO urbancache (WORD, DEFINITION, TAGS, ULINK, DEXAMPLE, USTAMP) VALUES ('
						+ DBot.MySQL.escape(cmd) + ', '
						+ DBot.MySQL.escape(def) + ', '
						+ DBot.MySQL.escape(tags) + ', '
						+ DBot.MySQL.escape(link) + ', '
						+ DBot.MySQL.escape(example) + ', '
						+ DBot.MySQL.escape(curr + 3600) + ')';
					
					DBot.query(q);
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
