
//
// Copyright (C) 2017 DBot.
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

import {CommandBase} from './CommandBase'
import {CommandContext} from './CommandContext'
import {BotInstance} from '../BotInstance'
import Discord = require('discord.js')

class CommandHolder {
	registeredCommands = new Map<string, CommandBase>()
	mappedCommands = new Map<string, CommandBase>()
	prefix = '{'
	bot: BotInstance

	get size() { return this.registerCommand.length }
	get length() { return this.registerCommand.length }

	constructor(bot: BotInstance) {
		this.bot = bot
		this.bot.addHook('OnMessage', 'CommandHolder', (msg: Discord.Message) => this.call(msg))
	}

	registerCommand(command: CommandBase) {
		this.registeredCommands.set(command.id, command)
		this.mappedCommands.set(command.id, command)

		for (const alias of command.alias) {
			this.mappedCommands.set(alias, command)
		}
	}

	has(command: string) {
		return this.mappedCommands.has(command)
	}

	values() {
		return this.registeredCommands.values()
	}

	getCommand(command: string) {
		return this.mappedCommands.get(command) || null
	}

	get(command: string) {
		return this.mappedCommands.get(command) || null
	}

	call(msg: Discord.Message, force = false) {
		if (msg.author.id == this.bot.uid && !force) {
			return null
		}

		if (!this.bot.checkAntispam(msg.author)) {
			return null
		}

		const raw = msg.content.trim()

		if (raw.substr(0, this.prefix.length) != this.prefix) {
			return null
		}

		const context = new CommandContext(this.bot, raw.substr(1), msg)
		context.parse()
		const getCommand = context.getCommand()

		if (!getCommand) {
			return null
		}

		const command = this.getCommand(getCommand)

		if (!command) {
			return null
		}

		if (!this.bot.addAntispam(msg.author, command.antispam(msg.author, msg))) {
			return null
		}

		context.importFlags(command)
		context.parseFull()

		const status = command.execute(context)

		if (status == false) {
			return null
		}

		return [context, command]
	}
}

export {CommandHolder}
