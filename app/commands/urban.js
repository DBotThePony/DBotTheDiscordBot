

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

if (!DBot.cfg.urban_enable) return;

const unirest = require('unirest');

module.exports = {
	name: 'urban',
	
	argNeeded: true,
	failMessage: 'Word required',
	delay: 4,
	
	help_args: '<phrase>',
	desc: 'Get a definition of word',
	
	func: function(args, cmd, msg) {
		msg.channel.startTyping();
		
		Postgres.query('SELECT * FROM urbancache WHERE "WORD" = ' + Postgres.escape(cmd), function(err, data) {
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
						+ Postgres.escape(cmd) + ', '
						+ Postgres.escape(def) + ', '
						+ Postgres.escape(tags) + ', '
						+ Postgres.escape(link) + ', '
						+ Postgres.escape(example) + ', '
						+ Postgres.escape(curr + 3600) + ') ON CONFLICT ("WORD") DO UPDATE SET\
						"WORD" = excluded."WORD",\
						"DEFINITION" = excluded."DEFINITION",\
						"TAGS" = excluded."TAGS",\
						"ULINK" = excluded."ULINK",\
						"DEXAMPLE" = excluded."DEXAMPLE", \
						"USTAMP" = excluded."USTAMP"';
					
					Postgres.query(q);
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
