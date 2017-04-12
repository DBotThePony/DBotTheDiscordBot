

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

let fix = function(str) {
	return str.replace(/@everyone/gi, '@pne').replace(/@here/gi, '@pne').replace(/@[^ ]+/gi, '@pne');
}

DBot.RegisterCommandPipe({
	name: 'reverse',
	alias: ['r'],
	
	argNeeded: true,
	failMessage: 'Missing phrase for reverse',
	
	help_args: '<phrase> ...',
	desc: 'Reverces a string',
	
	func: function(args, cmd, msg) {
		let out = '';
		
		for (i = cmd.length - 1; i >= 0; i--) {
			out += cmd[i];
		}
		
		return fix(out);
	},
});

DBot.RegisterCommandPipe({
	name: 'sreverse',
	alias: ['sr'],
	
	argNeeded: true,
	failMessage: 'Missing phrase for soft reverse',
	
	help_args: '<phrase> ...',
	desc: 'Reverces all phrases in command',
	
	func: function(args, cmd, msg) {
		let out = '';
		
		args.forEach(function(item) {
			for (i = item.length - 1; i >= 0; i--) {
				out += item[i];
			}
			
			out += ' ';
		});
		
		return fix(out);
	},
});
