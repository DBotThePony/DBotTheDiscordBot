

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
	name: 'wipepm',
	
	help_args: '',
	desc: 'Wipes some of old messages written by me in your PM',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg))
			return 'Must execute in PM channel ;n;';
		
		let conf = new DBot.Confirm(msg.author, msg.channel);
		
		conf.setTitle('Wipe of PM messages');
		conf.setDesc('');
		
		conf.confirm(function() {
			msg.channel.fetchMessages({limit: 100})
			.then(function(messages) {
				let arr = messages.array();
				
				for (let i in arr) {
					if (arr[i].author.id == DBot.bot.user.id) {
						arr[i].delete(0);
					}
				}
			});
		});
		
		conf.decline(function() {
			msg.reply('Aborting');
		});
		
		conf.echo();
	},
}
