

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

/* global Math, Postgres, DBot */

// https://dbot.serealia.ca/info/

module.exports = {
	name: 'infometer',
	alias: ['infometr', 'dmetr', 'info'],
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase>',
	desc: 'How much proven info is?',
	
	func: function(args, cmd, msg) {
		Postgres.query('SELECT "VALUE" FROM infometr WHERE "PHRASE" = ' + Postgres.escape(cmd.toLowerCase()), function(err, data) {
			if (data && data[0]) {
				msg.reply('\n```' + cmd + '\nInfo - ' + data[0].VALUE + '%```');
			} else {
				let length = cmd.length;
				let min = 0;
				let finalPercent = 0;
				
				let Jackpot = Math.Random(0, 25);
				
				if (Jackpot === 5) {
					finalPercent = Math.Random(75, 100);
				} else if (Jackpot === 2) {
					finalPercent = Math.Random(50, 75);
				} else if (Jackpot === 8) {
					finalPercent = Math.Random(30, 66);
				} else if (Jackpot === 10) {
					finalPercent = Math.Random(70, 80);
				} else if (Jackpot === 15) {
					finalPercent = Math.Random(75, 100);
				} else if (Jackpot === 18) {
					finalPercent = Math.Random(10, 40);
				} else if (Jackpot === 25) {
					finalPercent = 100;
				} else if (Jackpot === 18) {
					finalPercent = 0;
				} else if (Jackpot === 20) {
					finalPercent = Math.Random(40, 80);
				} else if (length > 50) {
					finalPercent = Math.Random(10, 100);
					
					if (Math.Random(0, 10) === 7)
						finalPercent = 100;
				} else if (length > 30) {
					finalPercent = Math.Random(0, 100);
					
					if (Math.Random(0, 15) === 5)
						finalPercent = 75;
					
					if (Math.Random(0, 15) === 7)
						finalPercent = 95;
				} else if (length > 10) {
					finalPercent = Math.Random(20, 100);
					
					if (Math.Random(0, 7) === 2)
						finalPercent = 75;
					
					if (Math.Random(0, 5) === 0)
						finalPercent = 100;
				} else {
					finalPercent = Math.Random(0, 100);
					
					if (Math.Random(0, 5) === 0)
						finalPercent = 100;
				}
				
				msg.reply('\n```' + cmd + '\nInfo - ' + finalPercent + '%```');
				
				Postgres.query('INSERT INTO infometr ("PHRASE", "VALUE") VALUES (' + Postgres.escape(cmd.toLowerCase()) + ', \'' + finalPercent + '\')');
			}
		});
		
		return true;
	}
};

DBot.RegisterPipe(module.exports);
