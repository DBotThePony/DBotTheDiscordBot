
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

import {CommandBase} from './CommandBase'
import {CommandContext} from './CommandContext'
import {BotInstance} from '../BotInstance'
import Discord = require('discord.js')
import { ServerCommandsState } from './CommandBansController'

class CommandHolder {
	registeredCommands = new Map<string, CommandBase>()
	mappedCommands = new Map<string, CommandBase>()
	categories = new Map<string, CommandBase[]>()
	currentCategoryArray: string[] | null = null
	lastCommandContext = new Map<string, CommandContext>()
	lastCommandContextChannel = new Map<string, Map<string, CommandContext>>()
	prefix = ['}', ')']
	bot: BotInstance
	banStates = new Map<string, ServerCommandsState>()

	get size() { return this.registerCommand.length }
	get length() { return this.registerCommand.length }

	constructor(bot: BotInstance) {
		this.bot = bot
		this.bot.client.on('message', (msg: Discord.Message) => this.call(msg))
	}

	lastContext(user: string | Discord.User | Discord.GuildMember | null) {
		if (typeof user == 'string') {
			return this.lastCommandContext.get(user) || null
		} else if (user instanceof Discord.User) {
			return this.lastCommandContext.get(user.id) || null
		} else if (user instanceof Discord.GuildMember) {
			return this.lastCommandContext.get(user.id) || null // ???
		}

		return null
	}

	lastContextChannel(channel: Discord.Channel | null, user: string | Discord.User | Discord.GuildMember | null) {
		if (!channel) {
			return null
		}

		let userid

		if (typeof user == 'string') {
			userid = user
		} else if (user instanceof Discord.User) {
			userid = user.id
		} else if (user instanceof Discord.GuildMember) {
			userid = user.id
		} else {
			return null
		}

		if (this.lastCommandContextChannel.has(userid)) {
			return (<Map<string, CommandContext>> this.lastCommandContextChannel.get(userid)).get(channel.id)
		}

		return null
	}

	setCategory(...categories: string[]) {
		for (const category of categories) {
			if (!this.categories.has(category)) {
				this.categories.set(category, [])
			}
		}

		this.currentCategoryArray = categories

		return this
	}

	unsetCategory() {
		this.currentCategoryArray = null
		return this
	}

	registerCommand(command: CommandBase) {
		command.setHolder(this)

		if (this.currentCategoryArray) {
			for (const category of this.currentCategoryArray) {
				this.categories.get(category)!.push(command)
			}
		}

		this.registeredCommands.set(command.id, command)
		this.mappedCommands.set(command.id, command)

		for (const alias of command.alias) {
			this.mappedCommands.set(alias, command)
		}

		return this
	}

	getCategory(category: string) {
		return this.categories.get(category)
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

	getServerBans(server: Discord.Guild): ServerCommandsState {
		if (this.banStates.has(server.id)) {
			return <ServerCommandsState> this.banStates.get(server.id)
		}

		const state = new ServerCommandsState(this.bot, server.id)
		this.banStates.set(server.id, state)
		return state
	}

	call(msg: Discord.Message, force = false): Promise<[CommandContext, CommandBase] | null> | null {
		if (msg.author.id == this.bot.uid && !force) {
			return null
		}

		if (!this.bot.checkAntispam(msg.author)) {
			return null
		}

		let raw = msg.content.trim()

		if (raw == '') {
			return null
		}

		let hitPrefix = false
		let pm = msg.channel.type == 'dm'

		for (const prefix of this.prefix) {
			if (raw.substr(0, prefix.length) == prefix) {
				raw = raw.substr(prefix.length)
				hitPrefix = true
				break
			}
		}

		if (!hitPrefix && !pm) {
			return null
		}

		const context = new CommandContext(this.bot, raw.trim(), msg)
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

		const executeCommand = (): [CommandContext, CommandBase] | null => {
			context.importFlags(command)
			context.parseFull()

			const status = command.execute(context)

			if (status == false) {
				return null
			}

			if (command.rememberContext && context.author) {
				this.lastCommandContext.set(context.author.id, context)

				if (context.channel) {
					if (!this.lastCommandContextChannel.has(context.author.id)) {
						this.lastCommandContextChannel.set(context.author.id, new Map())
					}

					(<Map<string, CommandContext>> this.lastCommandContextChannel.get(context.author.id)).set(context.channel.id, context)
				}

			}

			return [context, command]
		}

		return new Promise((resolve, reject) => {
			if (!context.inServer || context.member && context.member.hasPermission('ADMINISTRATOR') || context.isOwner) {
				return resolve(executeCommand())
			}

			const state = this.getServerBans(context.server!)
			state.resolveBanned(command)
			.then((serverBanStatus) => {
				if (serverBanStatus) {
					return
				}

				if (context.channel) {
					state.resolveChannelBanned(<Discord.TextChannel> context.channel, command)
					.then((channelBanStatus) => {
						if (channelBanStatus) {
							return
						}

						resolve(executeCommand())
					})
				} else {
					resolve(executeCommand())
				}
			})
		})
	}
}

export {CommandHolder}
