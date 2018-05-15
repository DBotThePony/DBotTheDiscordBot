
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

import {CommandBase, CommandExecutionInstance} from '../../CommandBase'
import {CommandHolder} from '../../CommandHolder'
import Discord = require('discord.js')

class WordWallCommand extends CommandBase {
	help = 'Creates a word wall'
	args = '<string>'

	constructor() {
		super('wordwall')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.get(1)) {
			instance.error('At least one word is required', 1)
			return
		}

		if (instance.raw.length > 25) {
			instance.error('the fuck?', 1)
			return
		}

		let len = instance.raw.length
		let build = '\n'

		for (let i = 0; i <= len; i++) {
			let sub = instance.raw.substr(i)

			if (sub != '') {
				sub += ' '
			}

			build += '\n' + sub + instance.raw.substr(0, i)
		}

		instance.reply('```\n' + build + '\n```')
	}
}

export {WordWallCommand}
