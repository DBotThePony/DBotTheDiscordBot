

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

const font = 'Hack-Regular';
const size = 48;

module.exports = {
	name: 'wordwall',
	alias: ['wwall'],
	
	help_args: '<phrase>',
	desc: 'Wally',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['wordwall'], 2, args);
		
		if (cmd.length > 1000)
			return 'the fuck?';
		
		let len = cmd.length;
		let build = '\n';
		
		for (let i = 0; i <= len; i++) {
			build += '\n' + cmd.substr(i) + ' ' + cmd.substr(0, i);
		}
		
		return '```' + build + '```';
	},
}

DBot.RegisterCommand({
	name: 'iwordwall',
	alias: ['iwwall'],
	
	help_args: '<phrase>',
	desc: 'Wally',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Need first phrase ;w;' + Util.HighlightHelp(['wordwall'], 2, args);
		
		if (cmd.length > 400)
			return 'the fuck? Try usual `wordwall`';
		
		let len = cmd.length;
		let build = '';
		
		for (let i = 0; i <= len; i++) {
			build += '\n' + cmd.substr(i) + ' ' + cmd.substr(0, i);
		}
		
		IMagick.DrawText({
			text: build,
			font: font,
			size: size,
		}, function(err, fpath, fpathU) {
			if (err) {
				msg.reply('<internal pony error>');
			} else {
				msg.reply(fpathU);
			}
		});
	},
});
