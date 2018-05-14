
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

import {CommandBase, CommandExecutionInstance, ImageCommandBase} from '../CommandBase'
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')
import { BotInstance } from '../../BotInstance';

class CMDManip extends CommandBase {
	allowPipes = false
	help = 'Allows command banning and unbanning. Subcommands are list, listgroups, ban and unban'
	canBeBanned = false

	constructor(public isChannel: boolean) {
		super(isChannel && 'cmd_channel' || 'cmd')
	}

	canManage(instance: CommandExecutionInstance) {
		if (this.isChannel && !instance.hasPermissionExecutor('MANAGE_CHANNELS')) {
			instance.reply('You need both MANAGE_CHANNELS permission!')
			return false
		}

		if (!this.isChannel && !instance.hasPermissionExecutor('MANAGE_GUILD')) {
			instance.reply('You need MANAGE_GUILD permission!')
			return false
		}

		return true
	}

	bulkBan(instance: CommandExecutionInstance, commands: CommandBase[]) {
		if (!this.canManage(instance)) {
			return
		}

		if (!instance.server || !instance.channel) {
			throw new Error('Invalid execution instance')
		}

		const bans = instance.bot.commands.getServerBans(instance.server)

		if (this.isChannel) {
			bans.bulkChannelBan(<Discord.TextChannel> instance.channel, ...commands)
			.then((result) => {
				const lines = []

				for (const [command, status, reason] of result) {
					lines.push(command.id + ': ' + reason + ` (${status})`)
				}

				instance.reply('Bulk ban from <#' + (<Discord.Channel> instance.channel).id + '>: ```\n' + lines.join('\n') + '```')
			})
			.catch((result) => {
				instance.reply('Failed to ban: ```\n' + result + '```')
			})
		} else {
			bans.bulkBan(...commands)
			.then((result) => {
				const lines = []

				for (const [command, status, reason] of result) {
					lines.push(command.id + ': ' + reason + ` (${status})`)
				}

				instance.reply('Bulk ban: ```\n' + lines.join('\n') + '```')
			})
			.catch((result) => {
				instance.reply('Failed to ban: ```\n' + result + '```')
			})
		}
	}

	bulkUnban(instance: CommandExecutionInstance, commands: CommandBase[]) {
		if (!this.canManage(instance)) {
			return
		}

		if (!instance.server || !instance.channel) {
			throw new Error('Invalid execution instance')
		}

		const bans = instance.bot.commands.getServerBans(instance.server)

		if (this.isChannel) {
			bans.bulkChannelUnban(<Discord.TextChannel> instance.channel, ...commands)
			.then((result) => {
				const lines = []

				for (const [command, status, reason] of result) {
					lines.push(command.id + ': ' + reason + ` (${status})`)
				}

				instance.reply('Bulk unban from <#' + (<Discord.Channel> instance.channel).id + '>: ```\n' + lines.join('\n') + '```')
			})
			.catch((result) => {
				instance.reply('Failed to unban: ```\n' + result + '```')
			})
		} else {
			bans.bulkUnban(...commands)
			.then((result) => {
				const lines = []

				for (const [command, status, reason] of result) {
					lines.push(command.id + ': ' + reason + ` (${status})`)
				}

				instance.reply('Bulk unban: ```\n' + lines.join('\n') + '```')
			})
			.catch((result) => {
				instance.reply('Failed to unban: ```\n' + result + '```')
			})
		}
	}

	ban(instance: CommandExecutionInstance) {
		if (!this.canManage(instance)) {
			return
		}

		if (!instance.server || !instance.channel) {
			throw new Error('Invalid execution instance')
		}

		if (!instance.assert(2, 'Missing command')) {
			return
		}

		const command = (<BotInstance> this.bot).commands.get((<string> instance.get(2)).toLowerCase())

		if (!command) {
			const list = (<BotInstance> this.bot).commands.getCategory((<string> instance.get(2)).toLowerCase())

			if (list) {
				return this.bulkBan(instance, list)
			}

			instance.error('Invalid command specified', 2)
			return
		}

		const bans = instance.bot.commands.getServerBans(instance.server)

		if (this.isChannel) {
			bans.banChannelCommand(<Discord.TextChannel> instance.channel, command)
			.then((result) => {
				instance.reply(command.id + ' ban from <#' + (<Discord.Channel> instance.channel).id + '>: ```\n' + result + '```')
			})
			.catch((result) => {
				instance.reply(command.id + ' ban from <#' + (<Discord.Channel> instance.channel).id + '>: ```\n' + result + '```')
			})
		} else {
			bans.banCommand(command)
			.then((result) => {
				instance.reply(command.id + ' ban: ```\n' + result + '```')
			})
			.catch((result) => {
				instance.reply(command.id + ' ban: ```\n' + result + '```')
			})
		}
	}

	unban(instance: CommandExecutionInstance) {
		if (!this.canManage(instance)) {
			return
		}

		if (!instance.server || !instance.channel) {
			throw new Error('Invalid execution instance')
		}

		if (!instance.assert(2, 'Missing command')) {
			return
		}

		const command = (<BotInstance> this.bot).commands.get((<string> instance.get(2)).toLowerCase())

		if (!command) {
			const list = (<BotInstance> this.bot).commands.getCategory((<string> instance.get(2)).toLowerCase())

			if (list) {
				return this.bulkUnban(instance, list)
			}

			instance.error('Invalid command specified', 2)
			return
		}

		const bans = instance.bot.commands.getServerBans(instance.server)

		if (this.isChannel) {
			bans.unbanChannelCommand(<Discord.TextChannel> instance.channel, command)
			.then((result) => {
				instance.reply(command.id + ' unban from <#' + (<Discord.Channel> instance.channel).id + '>: ```\n' + result + '```')
			})
			.catch((result) => {
				instance.reply(command.id + ' unban from <#' + (<Discord.Channel> instance.channel).id + '>: ```\n' + result + '```')
			})
		} else {
			bans.unbanCommand(command)
			.then((result) => {
				instance.reply(command.id + ' unban: ```\n' + result + '```')
			})
			.catch((result) => {
				instance.reply(command.id + ' unban: ```\n' + result + '```')
			})
		}
	}

	list(instance: CommandExecutionInstance) {
		if (!instance.server || !instance.channel) {
			throw new Error('Invalid execution instance')
		}

		let list: CommandBase[]

		if (this.isChannel) {
			list = instance.bot.commands.getServerBans(instance.server).commandListChannel(<Discord.TextChannel> instance.channel)
		} else {
			list = instance.bot.commands.getServerBans(instance.server).commandList()
		}

		if (list.length == 0) {
			instance.reply('No commands are present in ban list.')
			return
		}

		const namelist = []

		for (const command of list) {
			if (command.hasAlias()) {
				namelist.push(command.id + ' (' + command.alias.join(', ') + ')')
			} else {
				namelist.push(command.id)
			}
		}

		instance.reply('Commands in banlist are: ```\n' + namelist.join(', ') + '```')
	}

	listGroups(instance: CommandExecutionInstance) {
		if (!this.bot) {
			throw new Error('Invalid bot instance')
		}

		const list = []

		for (const id of this.bot.commands.categories.keys()) {
			list.push(id)
		}

		instance.reply('Avaliable groups are: ```\n' + list.join(', ') + '```')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.get(1)) {
			instance.error('Invalid action specified. Valid are ban, unban and list', 1)
			return
		}

		switch ((<string> instance.get(1)).toLowerCase()) {
			case 'ban':
				this.ban(instance)
				return
			case 'unban':
				this.unban(instance)
				return
			case 'list':
				this.list(instance)
				return
			case 'listgroups':
				this.listGroups(instance)
				return
		}

		instance.error('Invalid action specified. Valid are ban, unban and list', 1)
	}
}

export {CMDManip}
