

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

module.exports = {
	name: 'eval',
	alias: ['debug'],
	
	help_args: '<code>',
	desc: 'Bot owner only',
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (!DBot.owners.includes(msg.author.id))
			return 'Not a bot owner';
		
		let myValue;
		let split = msg.content.split(' ');
		split.splice(0, 1);
		
		try {
			myValue = eval(split.join(' '));
		} catch(err) {
			msg.sendMessage('```\n' + err.stack + '\n```');
			return;
		}
		
		if (myValue === undefined) {
			msg.sendMessage('```undefined```');
		} else if (myValue === null) {
			msg.sendMessage('```null```');
		} else {
			msg.sendMessage('```\n' + myValue.toString() + '\n```');
		}
	}
};

DBot.RegisterCommand({
	name: 'sql',
	
	help_args: '<code>',
	desc: 'Bot owner only',
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (!DBot.owners.includes(msg.author.id))
			return 'Not a bot owner';
		
		msg.channel.startTyping();
		
		let split = msg.content.split(' ');
		split.splice(0, 1);
		
		DBot.secondarySQLConnection.query(split.join(' '), function(err, data) {
			msg.channel.stopTyping();
			
			if (err) {
				msg.reply('```\n' + err.stack + '\n```');
				return;
			}
			
			let output = '```\n';
			
			for (let row of data) {
				let mid = [];
				
				for (let i in row) {
					mid.push(row[i]);
				}
				
				output += '[' +  mid.join(', ') + ']\n';
			}
			
			msg.reply(output + '```');
		});
	}
});
