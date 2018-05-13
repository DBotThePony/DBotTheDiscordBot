
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
const cowsay = require('cowsay');

class Cowsay extends CommandBase {
	askFile: string

	constructor(cowname: string) {
		super(cowname + 'say', cowname)
		this.help = cowname + 'say the word'
		this.askFile = cowname

		if (cowname == 'cow') {
			this.askFile = 'default'
		}
	}

	executed(instance: CommandExecutionInstance) {
		const result = <string> cowsay.say({
			text: instance.raw.replace(/```/gi, '``\`'),
			f: this.askFile
		})

		return '```' + result + '```'
	}
}

const cows = [
	'cow',
	'tux',
	'sheep',
	'www',
	'dragon',
	'vader',
];

const RegisterCowsay = function(holder: CommandHolder) {
	for (const cow of cows) {
		holder.registerCommand(new Cowsay(cow))
	}
}

export {RegisterCowsay}
