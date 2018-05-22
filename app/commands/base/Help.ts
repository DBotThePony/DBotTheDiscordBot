
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
import {CommandContext} from '../CommandContext'
import {CommandHolder} from '../CommandHolder'
import {BotInstance} from '../../BotInstance'
import {validNumber} from '../../../lib/NumberUtil'

const replaceDesc = /\r?\n/gi

class Help extends CommandBase {
	helpStrs: string[] = []
	allowPipes = false
	canBeBanned = false

	constructor() {
		super('help', '?', 'h')
		this.help = 'Shows help'
	}

	buildHelp() {
		this.helpStrs = []

		let helpPages = 0

		for (const command of (<BotInstance> this.bot).commands.values()) {
			if (!command.displayHelp) {
				continue
			}

			helpPages++
		}

		helpPages = Math.ceil(helpPages / 15)

		let page = 1
		let current = `Help page: ${page}/${helpPages}\n` + '```'
		let i = 1

		for (const command of (<BotInstance> this.bot).commands.values()) {
			if (!command.displayHelp) {
				continue
			}

			current += '\n - ' + command.id

			if (command.hasArguments()) {
				current += ' ' + command.getArgumentsString()
			}

			if (command.hasAlias()) {
				current += ' (' + command.alias.join(', ') + ')'
			}

			if (command.hasHelp()) {
				current += '\n       ' + command.help.replace(replaceDesc, '\n    ')
			}

			i++

			if (i > 15) {
				current += '```'
				this.helpStrs[page - 1] = current
				page++
				current = `Help page: ${page}/${helpPages}\n` + '```'
				i = 1
			}
		}

		if (i > 1) {
			current += '```'
			this.helpStrs[page - 1] = current
		}
	}

	executed(instance: CommandExecutionInstance) {
		if (this.helpStrs.length == 0) {
			this.buildHelp()
		}

		if (instance.hasArguments()) {
			const command = <string> instance.next().toLowerCase()
			const commandObj = (<BotInstance> this.bot).commands.get(command)
			const page = validNumber(command)

			if (commandObj) {
				let usage = 'Usage: ' + commandObj.id + ' ' + commandObj.getArgumentsString()

				if (commandObj.hasHelp()) {
					usage += '\nHelp:\n```' + commandObj.help + '```'
				}

				instance.send(usage)
			} else if (page) {
				if (!this.helpStrs[page - 1]) {
					instance.reply('Not a valid page number!')
					return
				}

				if (instance.inServer) {
					instance.reply('Sent over DM')
				}

				instance.sendPM(this.helpStrs[page - 1])
			} else {
				instance.reply('Unknown command: ' + command)
			}
		} else {
			if (instance.inServer) {
				instance.reply('Sent over DM')
			}

			instance.sendPM(this.helpStrs[0])
		}
	}
}

export {Help}
