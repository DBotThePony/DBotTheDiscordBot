

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

'use strict';

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
	name: 'rtd',
	alias: ['roll'],
	
	help_args: '[amount of edges] [times]',
	desc: 'Rolls the dice!',
	
	func: function(args, cmd, msg) {
		let edges = Math.floor(Number.from(args[0]) || 6);
		let times = Math.floor(Number.from(args[1]) || 1);
		
		if (edges <= 1)
			return 'One edge? wot';
		
		if (edges > 100)
			edges = 100;
		
		if (times <= 0)
			return 'How can i throw it 0 times? 6.9';
		
		if (times > 10)
			times = 10;
		
		let rolls = [];
		
		for (let i = 1; i <= times; i++) {
			rolls.push(Math.Random(1, edges));
		}
		
		if (!DBot.IsPM(msg))
			msg.channel.sendMessage(msg.author + ' rolled: ' + rolls.join(', '));
		else
			msg.channel.sendMessage('Rolled: ' + rolls.join(', '));
	}
}
