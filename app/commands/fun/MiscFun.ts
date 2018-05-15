
//
// Copyright (C) 2017-2018 DBot.
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

import {CommandBase, CommandExecutionInstance} from '../CommandBase'
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')

class XD extends CommandBase {
	help = 'XD'

	constructor() {
		super('xd')
	}

	executed(instance: CommandExecutionInstance) {
		let arg1, arg2, arg3

		if (instance.length > 3) {
			instance.error('Maximum is 3 arguments', 4)
			return
		} else {
			if (instance.length == 0) {
				instance.error('At least one argument is required', 1)
				return
			}

			for (const [i, arg] of instance) {
				if (arg.length > 10) {
					instance.error('Argument is too long', i)
					return
				}
			}

			arg1 = instance.next()
			arg2 = instance.next() || arg1
			arg3 = instance.next() || arg1
		}

		let middleSpaces = 11;
		let preMiddleSpaces = 7;

		if (arg1.length === 1) {
			preMiddleSpaces = 6;
			middleSpaces = 10;
		} else if (arg1.length === 2) {
			middleSpaces = 11 - (3 - arg1.length);
		} else if (arg1.length > 3) {
			preMiddleSpaces += Math.floor((arg1.length - 3) / 3) + 1;
			middleSpaces += Math.floor((arg1.length - 3) / 2.2 + .5);
		}

		if (arg1.length === 10) {
			preMiddleSpaces++;
		}

		let build = `${arg1}           ${arg1}    ${arg2} ${arg3}\n  ${arg1}       ${arg1}      ${arg2}    ${arg3}\n    ${arg1}   ${arg1}        ${arg2}     ${arg3}\n${' '.repeat(preMiddleSpaces)}${arg1}${' '.repeat(middleSpaces)}${arg2}     ${arg3}\n    ${arg1}   ${arg1}        ${arg2}     ${arg3}\n  ${arg1}       ${arg1}      ${arg2}    ${arg3}\n${arg1}           ${arg1}    ${arg2} ${arg3}`;

		return '```\n' + build + '\n```';
	}
}

interface shutup {
	[key: string]: string | undefined
}

const leet_charmap = <shutup> {
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
}

const leetmap_array = []

for (let i in leet_charmap) {
	leetmap_array.push(i)
}

const lett_match = new RegExp('(' + leetmap_array.join('|') + ')', 'gi')

class Leet extends CommandBase {
	help = 'l33t'
	args = '<string>'

	constructor() {
		super('l33t', 'leet', 'leetspeak', 'l33tspeak')
	}

	executed(instance: CommandExecutionInstance) {
		if (instance.length == 0) {
			instance.error('Phrase is required', 1)
			return
		}

		return instance.raw.replace(lett_match, (m, p) => {
			return leet_charmap[p.toLowerCase()] || m
		})
	}
}


export {XD, Leet}
