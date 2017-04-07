

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

const unirest = require('unirest');
const fs = require('fs');
const path = 'D:/www/derpco/bot/tomb';

let endPhrases = [
	'Rest in peace',
	'Died twice',
	'Dead in sphghetti never forgetti',
];

module.exports = {
	name: 'rip',
	
	argNeeded: true,
	failMessage: 'You need at least one argument',
	
	help_args: '<first> [second 0-3]',
	desc: 'Post a RIP',
	
	func: function(args, cmd, msg) {
		args[1] = args[1] || Array.Random(endPhrases);
		let bArgs = '';
		
		for (let i = 0; i < Math.min(args.length, 3); i++) {
			bArgs += '&top' + (i + 1) + '=' + encodeURIComponent(args[i]);
		}
		
		msg.channel.startTyping();
		
		let hash = String.hash(bArgs);
		let myPath = path + '/' + hash + '.jpg';
		let url = 'https://dbot.serealia.ca/bot/tomb/' + hash + '.jpg';
		
		fs.stat(myPath, function(err, stat) {
			if (msg.checkAbort()) return;
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(url);
			} else {
				unirest.get('http://www.tombstonebuilder.com/generate.php?' + bArgs)
				.encoding(null)
				.end(function(result) {
					if (msg.checkAbort()) return;
					msg.channel.stopTyping();
					fs.writeFile(myPath, result.body);
					msg.reply(url);
				});
			}
		});
	},
}
