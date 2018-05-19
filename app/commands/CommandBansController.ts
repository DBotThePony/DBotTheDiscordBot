
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
	loadCallbacksCatch: ((...args: any[]) => any)[] = []

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

				if (values.rows[0]) {
					for (const commandID of values.rows[0].commands) {
						const command = this.bot.commands.get(commandID)

						if (command) {
							this.commands.push(command)
						}
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
			.catch((err) => {
				console.error(err)

				for (const reject of this.loadCallbacksCatch) {
					reject()
				}
			})
		})
		.catch((err) => {
			console.error(err)

			for (const reject of this.loadCallbacksCatch) {
				reject()
			}
		})
	}

	isBanned(command: CommandBase) {
		return this.commands.includes(command)
	}

	canBan(command: CommandBase) {
		return !this.isBanned(command) && command.canBeBanned
	}

	resolveOnLoaded(): Promise<this> {
		return new Promise((resolve, reject) => {
			if (this.loaded) {
				resolve(this)
				return
			}

			this.loadCallbacks.push(() => {
				resolve(this)
			})

			this.loadCallbacksCatch.push(() => {
				//reject(this) // ???
				resolve(this) // ???
			})
		})
	}

	resolveBanned(command: CommandBase): Promise<boolean> {
		return new Promise((resolve, reject) => {
			if (this.loaded) {
				resolve(this.isBanned(command))
			} else {
				this.loadCallbacks.push(() => {
					resolve(this.isBanned(command))
				})

				this.loadCallbacksCatch.push(() => {
					reject(this.isBanned(command))
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

				this.loadCallbacksCatch.push(() => {
					reject(this.isBanned(command))
				})
			}
		})
	}

	getChannel(channel: Discord.TextChannel | string) {
		const id = this.resolveChannelID(channel)

		if (this.channels.has(id)) {
			return <CommandBase[]> this.channels.get(id)
		}

		this.channels.set(id, [])
		return <CommandBase[]> this.channels.get(id)
	}

	resolveChannelID(channel: Discord.TextChannel | string) {
		return typeof channel == 'string' && channel || (<Discord.TextChannel> channel).id
	}

	isBannedChannel(channel: Discord.TextChannel | string, command: CommandBase) {
		return this.getChannel(this.resolveChannelID(channel)).includes(command)
	}

	canBanChannel(channel: Discord.TextChannel | string, command: CommandBase) {
		return !this.isBannedChannel(channel, command) && command.canBeBanned
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
			.catch(reject)
		})
	}

	unbanCommand(command: CommandBase): Promise<string> {
		return new Promise((resolve, reject) => {
			if (!this.isBanned(command)) {
				reject('Command is not banned!')
				return
			}

			if (!this.bot.sql) {
				throw new Error('Bad bot initialization')
			}

			this.bot.sql.query(`UPDATE "command_ban_server" SET "commands" = array_remove("commands", '${command.id}') WHERE "server" = ${this.serverid}`)
			.then((value) => {
				this.commands.splice(this.commands.indexOf(command), 1)
				resolve('Command unbanned successfully')
			})
			.catch(reject)
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

			this.bot.sql.query(`INSERT INTO "command_ban_channel" VALUES (${this.serverid}, ${this.resolveChannelID(channel)}, ARRAY['${command.id}']) ON CONFLICT ("server", "channel") DO UPDATE
				SET "commands" = "command_ban_channel"."commands" || excluded."commands"`)
			.then((value) => {
				this.getChannel(channel).push(command)
				resolve('Command banned successfully')
			})
			.catch(reject)
		})
	}

	unbanChannelCommand(channel: Discord.TextChannel | string, command: CommandBase): Promise<string> {
		return new Promise((resolve, reject) => {
			if (!this.isBannedChannel(channel, command)) {
				reject('Command is not banned!')
				return
			}

			if (!this.bot.sql) {
				throw new Error('Bad bot initialization')
			}

			this.bot.sql.query(`UPDATE "command_ban_channel" SET "commands" = array_remove("commands", '${command.id}') WHERE "server" = ${this.serverid} AND "channel" = ${this.resolveChannelID(channel)}`)
			.then((value) => {
				this.getChannel(channel).splice(this.getChannel(channel).indexOf(command), 1)
				resolve('Command unbanned successfully')
			})
			.catch(reject)
		})
	}

	bulkBan(...commands: CommandBase[]): Promise<[CommandBase, boolean, string][]> {
		return new Promise((resolve, reject) => {
			const statuses: any[] = []
			let amount = commands.length

			this.bot.sql.query(`BEGIN`).then(() => {
				for (const command of commands) {
					this.banCommand(command)
					.then((status) => {
						amount--
						statuses.push([command, true, status])

						if (amount == 0) {
							this.bot.sql.query(`COMMIT`).then(() => resolve(statuses)).catch(err => reject(err))
						}
					})
					.catch((reason) => {
						amount--
						statuses.push([command, false, reason])

						if (amount == 0) {
							this.bot.sql.query(`COMMIT`).then(() => resolve(statuses)).catch(err => reject(err))
						}
					})
				}
			})
		})
	}

	bulkUnban(...commands: CommandBase[]): Promise<[CommandBase, boolean, string][]> {
		return new Promise((resolve, reject) => {
			const statuses: any[] = []
			let amount = commands.length

			this.bot.sql.query(`BEGIN`).then(() => {
				for (const command of commands) {
					this.unbanCommand(command)
					.then((status) => {
						amount--
						statuses.push([command, true, status])

						if (amount == 0) {
							this.bot.sql.query(`COMMIT`).then(() => resolve(statuses)).catch(err => reject(err))
						}
					})
					.catch((reason) => {
						amount--
						statuses.push([command, false, reason])

						if (amount == 0) {
							this.bot.sql.query(`COMMIT`).then(() => resolve(statuses)).catch(err => reject(err))
						}
					})
				}
			})
		})
	}

	bulkChannelBan(channel: Discord.TextChannel | string, ...commands: CommandBase[]): Promise<[CommandBase, boolean, string][]> {
		return new Promise((resolve, reject) => {
			const statuses: any[] = []
			let amount = commands.length

			this.bot.sql.query(`BEGIN`).then(() => {
				for (const command of commands) {
					this.banChannelCommand(channel, command)
					.then((status) => {
						amount--
						statuses.push([command, true, status])

						if (amount == 0) {
							this.bot.sql.query(`COMMIT`).then(() => resolve(statuses)).catch(err => reject(err))
						}
					})
					.catch((reason) => {
						amount--
						statuses.push([command, false, reason])

						if (amount == 0) {
							this.bot.sql.query(`COMMIT`).then(() => resolve(statuses)).catch(err => reject(err))
						}
					})
				}
			})
		})
	}

	bulkChannelUnban(channel: Discord.TextChannel | string, ...commands: CommandBase[]): Promise<[CommandBase, boolean, string][]> {
		return new Promise((resolve, reject) => {
			const statuses: any[] = []
			let amount = commands.length

			this.bot.sql.query(`BEGIN`).then(() => {
				for (const command of commands) {
					this.unbanChannelCommand(channel, command)
					.then((status) => {
						amount--
						statuses.push([command, true, status])

						if (amount == 0) {
							this.bot.sql.query(`COMMIT`).then(() => resolve(statuses)).catch(err => reject(err))
						}
					})
					.catch((reason) => {
						amount--
						statuses.push([command, false, reason])

						if (amount == 0) {
							this.bot.sql.query(`COMMIT`).then(() => resolve(statuses)).catch(err => reject(err))
						}
					})
				}
			})
		})
	}

	commandList() {
		return this.commands
	}

	commandListChannel(channel: Discord.TextChannel | string) {
		if (!this.channels.has(this.resolveChannelID(channel))) {
			return []
		}

		return <CommandBase[]> this.channels.get(this.resolveChannelID(channel))
	}
}

export {ServerCommandsState}
