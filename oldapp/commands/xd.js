

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
	name: 'xd',

	help_args: '<phrase>',
	desc: 'XD',

	func: function(args, cmd, msg) {
		if (args.length > 3)
			return 'Max 3 arguments';
		else {
			if (args[0] === undefined)
				return DBot.CommandError('You need at least one argument', 'xd', args, 1);

			if (args[1] === undefined)
				args[1] = args[0];

			if (args[2] === undefined)
				args[2] = args[1];
		}

		for (const i in args) {
			const arg = args[i];
			if (arg.length > 10)
				return DBot.CommandError('Argument is too long', 'xd', args, Number(i) + 1);
		}

		let middleSpaces = 11;
		let preMiddleSpaces = 7;

		if (args[0].length === 1) {
			preMiddleSpaces = 6;
			middleSpaces = 10;
		} else if (args[0].length === 2) {
			middleSpaces = 11 - (3 - args[0].length);
		} else if (args[0].length > 3) {
			preMiddleSpaces += Math.floor((args[0].length - 3) / 3) + 1;
			middleSpaces += Math.floor((args[0].length - 3) / 2.2 + .5);
		}

		if (args[0].length === 10) {
			preMiddleSpaces++;
		}

		let build = `${args[0]}           ${args[0]}    ${args[1]} ${args[2]}
  ${args[0]}       ${args[0]}      ${args[1]}    ${args[2]}
    ${args[0]}   ${args[0]}        ${args[1]}     ${args[2]}
${String.spaces(preMiddleSpaces)}${args[0]}${String.spaces(middleSpaces)}${args[1]}     ${args[2]}
    ${args[0]}   ${args[0]}        ${args[1]}     ${args[2]}
  ${args[0]}       ${args[0]}      ${args[1]}    ${args[2]}
${args[0]}           ${args[0]}    ${args[1]} ${args[2]}`;

		return '```\n' + build + '\n```';
	}
};
