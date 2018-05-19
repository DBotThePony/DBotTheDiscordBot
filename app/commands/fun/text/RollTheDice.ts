
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

import {CommandBase, CommandExecutionInstance, ImageCommandBase} from '../../CommandBase'
import {CommandHolder} from '../../CommandHolder'
import Discord = require('discord.js')

class RollTheDice extends CommandBase {
	help = 'Rolls the dice'
	args = '[edges] [times]'

	constructor() {
		super('rtd', 'rollthedice', 'dice')
	}

	executed(instance: CommandExecutionInstance) {
		let edges = instance.get(1) || 6
		let times = instance.get(2) || 1

		if (typeof edges == 'string') {
			const split = edges.split('d')

			if (split.length == 2) {
				edges = parseInt(split[0])
				times = parseInt(split[1])

				if (edges != edges) {
					instance.error('Invalid amount of edges provided' , 1)
					return
				}

				if (times != times) {
					instance.error('Invalid attempts provided' , 1)
					return
				}

				if (times > 20 || times <= 0) {
					instance.error('wtf' , 1)
					return
				}
			} else {
				edges = parseInt(edges)

				if (edges != edges) {
					instance.error('Invalid amount of edges provided' , 1)
					return
				}
			}

			if (edges > 100 || edges <= 1) {
				instance.error('wtf' , 1)
				return
			}
		}

		if (typeof times == 'string') {
			times = parseInt(times)

			if (times != times) {
				instance.error('Invalid attempts provided' , 2)
				return
			}

			if (times > 20 || times <= 0) {
				instance.error('wtf' , 2)
				return
			}
		}

		const rolls: number[] = []

		for (let roll = 1; roll <= times; roll++) {
			rolls.push(Math.floor(Math.random() * (edges - 1)) + 1)
		}

		if (instance.isPM) {
			instance.send('You rolled: ```\n' + rolls.join(', ') + '\n```')
		} else {
			instance.send('<@' + instance.author!.id + '> rolled: ```\n' + rolls.join(', ') + '\n```')
		}
	}
}

export {RollTheDice}
