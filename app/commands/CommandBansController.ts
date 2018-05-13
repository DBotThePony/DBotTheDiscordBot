
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

import events = require('events')
import Discord = require('discord.js')
import { BotInstance } from '../BotInstance';
import { CommandBase } from './CommandBase';

class ServerCommandsState {
	commands: CommandBase[] = []
	channels = new Map<string, CommandBase[]>()
	loaded = false
	loadCallbacks: ((...args: any[]) => any)[] = []

	constructor(public bot: BotInstance, public serverid: string) {
		if (!this.bot.sql) {
			throw new Error('Bad bot initialization')
		}

		const sql = this.bot.sql

		sql.query(`SELECT "commands" FROM "command_ban_server" WHERE "server" = ${this.serverid}`)
		.then((values) => {
			sql.query(`SELECT "channel", "commands" FROM "command_ban_channel" WHERE "server" = ${this.serverid}`)
			.then((values2) => {
				this.loaded = true

				if (values.rowCount == 0 && values2.rowCount == 0) {
					for (const resolve of this.loadCallbacks) {
						resolve()
					}

					return
				}

				for (const commandID of values.rows[0].commands) {
					const command = this.bot.commands.get(commandID)

					if (command) {
						this.commands.push(command)
					}
				}

				for (const row of values2.rows) {
					const channel = row.channel
					const commands = row.commands

					const target: CommandBase[] = []
					this.channels.set(channel, target)

					for (const commandID of commands) {
						const command = this.bot.commands.get(commandID)

						if (command) {
							target.push(command)
						}
					}
				}

				for (const resolve of this.loadCallbacks) {
					resolve()
				}
			})
		})
	}

	isBanned(command: CommandBase) {
		return this.commands.includes(command)
	}

	canBan(command: CommandBase) {
		return !this.isBanned(command) && command.canBeBanned
	}

	resolveBanned(command: CommandBase): Promise<boolean> {
		return new Promise((resolve, reject) => {
			if (this.loaded) {
				resolve(this.isBanned(command))
			} else {
				this.loadCallbacks.push(() => {
					resolve(this.isBanned(command))
				})
			}
		})
	}

	resolveChannelBanned(channel: Discord.TextChannel | string, command: CommandBase): Promise<boolean>{
		return new Promise((resolve, reject) => {
			if (this.loaded) {
				resolve(this.isBannedChannel(channel, command))
			} else {
				this.loadCallbacks.push(() => {
					resolve(this.isBannedChannel(channel, command))
				})
			}
		})
	}

	resolveChannelID(channel: Discord.TextChannel | string) {
		return typeof channel == 'string' && channel || (<Discord.TextChannel> channel).id
	}

	isBannedChannel(channel: Discord.TextChannel | string, command: CommandBase) {
		return this.commands.includes(command)
	}

	canBanChannel(channel: Discord.TextChannel | string, command: CommandBase) {
		return !this.isBanned(command) && command.canBeBanned
	}

	banCommand(command: CommandBase): Promise<string> {
		return new Promise((resolve, reject) => {
			if (this.isBanned(command)) {
				reject('Command is already banned!')
				return
			}

			if (!this.canBan(command)) {
				reject('Command cannot be banned!')
				return
			}

			if (!this.bot.sql) {
				throw new Error('Bad bot initialization')
			}

			this.bot.sql.query(`INSERT INTO "command_ban_server" VALUES (${this.serverid}, ARRAY['${command.id}']) ON CONFLICT ("server") DO UPDATE
				SET "commands" = "command_ban_server"."commands" || excluded."commands"`)
			.then((value) => {
				this.commands.push(command)
				resolve('Command banned successfully')
			})
		})
	}

	banChannelCommand(channel: Discord.TextChannel | string, command: CommandBase): Promise<string> {
		return new Promise((resolve, reject) => {
			if (this.isBannedChannel(channel, command)) {
				reject('Command is already banned!')
				return
			}

			if (!this.canBanChannel(channel, command)) {
				reject('Command cannot be banned!')
				return
			}

			if (!this.bot.sql) {
				throw new Error('Bad bot initialization')
			}

			this.bot.sql.query(`INSERT INTO "command_ban_channel" VALUES (${this.serverid}, ${this.resolveChannelID(channel)}, ARRAY['${command.id}']) ON CONFLICT ("server") DO UPDATE
				SET "commands" = "command_ban_server"."commands" || excluded."commands"`)
			.then((value) => {
				this.commands.push(command)
				resolve('Command banned successfully')
			})
		})
	}

	bulkBan(...commands: CommandBase[]) {

	}
}

export {ServerCommandsState}
