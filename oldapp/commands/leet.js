

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

// http://lurkmo.re/Leet

let charmap = {
	'a': '/-|',
	'b': '8',
	'c': '[',
	'с': '[',
	'd': '|)',
	'e': '3',
	'f': '|=',
	'g': '6',
	'h': '|-|',
	'i': '|',
	'j': ')',
	'k': '|(',
	'l': '1',
	'm': '|\\/|',
	'n': '|\\|',
	'o': '()',
	'p': '|>',
	'р': '|>',
	'q': '9',
	'r': '|2',
	's': '$',
	't': '7',
	'u': '|_|',
	'v': '\\/',
	'w': '\\/\\/',
	'x': '*',
	'y': '\'/',
	'у': '\'/',
	'z': '2',
	'г': 'r',
	'ж': '}|{',
	'з': '\'/_',
	'и': '|/|',
	'л': '/\\',
	'п': '|^|',
	'ф': '<|>',
	'ц': '||_',
	'ч': '\'-|',
	'ш': 'LLI',
	'щ': 'LLL',
	'ъ': '\'b',
	'ы': 'b|',
	'ь': '|o',
	'э': '€',
	'ю': '|-O',
	'я': '9|',
};

let jn = [];

for (let i in charmap)
	jn.push(i);

let charMaxExp = new RegExp('(' + jn.join('|') + ')', 'gi');

module.exports = {
	name: 'leet',
	alias: ['l33t'],
	
	help_args: '<text>',
	desc: 'l33t',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('Phrase needed', 'leet', args, 1);
		
		return cmd.replace(charMaxExp, function(m, p) {
			let l = p.toLowerCase();
			
			if (!charmap[l])
				return m;
			
			return charmap[l];
		});
	}
}
