
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

import {ConfigInstance} from './ConfigInstance'
import {CommandHolder} from './commands/CommandHolder'
import {CommandHelper} from './lib/CommandHelper'
import Discord = require('discord.js')
import {registerDefaultCommands} from './commands/DefaultCommands'
import pg = require('pg')
import fs = require('fs')
import { RegisterStatusWatchdog } from './modules/BotStatus';

interface BotStorage {
	[key: string]: any
}

interface AntispamStorage {
	// UserID -> UserObject, Score
	// Score should decrease each second
	[key: string]: number
}

class BotInstance {
	config: ConfigInstance
	client = new Discord.Client({})
	helper: CommandHelper
	commands: CommandHolder
	// shut up
	db!: pg.Client
	get sql() { return this.db }
	storage: BotStorage = {}
	antispam: AntispamStorage = {}
	decreaseID = setInterval(() => this.updateAntispam(), 3000)

	get id() { return this.client.user.id }
	get uid() { return this.client.user.id }

	constructor(configInstance: ConfigInstance, doLogin = false) {
		if (!configInstance.isValidSQL()) {
			throw new Error('SQL Data must be specified!')
		}

		this.config = configInstance

		this.helper = new CommandHelper(this)
		this.commands = new CommandHolder(this)

		registerDefaultCommands(this.commands)

		const config = configInstance.getSQL()

		if (!config) {
			console.error('No valid SQL config?')
			process.exit(1)
			return
		}

		this.client.on('error', (err) => {
			if (!err) {
				return
			}

			if (err.message == 'read ECONNRESET') {
				setTimeout(() => {
					this.login()
				}, 4000)
			}
		})

		this.db = new pg.Client(config)
		this.db.connect().then(() => {
			fs.readFile('./app/database.sql', (err, data) => {
				(<pg.Client> this.db).query(data.toString()).catch((err) => {
					console.error('SQL initialization error - ' + err)
					process.exit(1)
				}).then(() => {
					console.log('SQL database online')

					if (doLogin) {
						this.login()
					}
				})
			})
		}).catch((err) => {
			console.error('SQL initialization error - ' + err)
			process.exit(1)
		})
}

	updateAntispam() {
		//if (this.client.status != 0) {
		//  return
		//}

		for (const ID in this.antispam) {
			const time = this.antispam[ID] - 1

			if (time > 0) {
				this.antispam[ID] = time
			} else {
				delete this.antispam[ID]
			}
		}
	}

	// less weight - stricter check
	checkAntispam(user: Discord.User, weight = 3) {
		if (!this.antispam[user.id]) {
			return true
		}

		if (this.antispam[user.id] >= weight) {
			return false
		}

		return true
	}

	addAntispam(user: Discord.User, weight = 1, limit = 3) {
		if (!this.antispam[user.id]) {
			this.antispam[user.id] = weight
			return true
		}

		if (this.antispam[user.id] >= limit) {
			return false
		}

		this.antispam[user.id] += weight
		return true
	}

	query(...args: any[]) {
		if (!this.db) {
			throw new Error('Invalid intiialization')
		}

		return this.db.query.apply(this.db, args)
	}

	channel(id: string) {
		return this.client.channels.get(id)
	}

	server(id: string) {
		return this.client.guilds.get(id)
	}

	online() {
		RegisterStatusWatchdog(this)
	}

	login() {
		return this.client.login(this.config.token)
				.catch(console.error)
				.then(() => {
					console.log(`Bot with ID ${this.client.user.id} is now online`)
					this.online()
				})
	}
}

export {BotInstance}
