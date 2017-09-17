
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

import {ConfigInstance} from './ConfigInstance'
import {CommandHolder} from './commands/CommandHolder'
import {Hook} from '../lib/glib/hook'
import Discord = require('discord.js')
import {registerDefaultCommands} from './commands/DefaultCommands'

const DefaultHooksMap = [
	['message', 'OnMessage'],
	['channelCreate', 'ChannelCreated'],
	['ready', 'BotOnline'],
]

class BotInstance {
	config: ConfigInstance
	hooks = new Hook()
	client = new Discord.Client({})
	commands = new CommandHolder(this)

	get id() { return this.client.user.id }
	get uid() { return this.client.user.id }

	constructor(configInstance: ConfigInstance, doLogin = false) {
		if (!configInstance.isValidSQL()) {
			throw new Error('SQL Data must be specified!')
		}

		this.config = configInstance

		this.registerHooks()
		registerDefaultCommands(this.commands)

		if (doLogin) {
			this.login()
		}
	}

	channel(id: string) {
		return this.client.channels.get(id)
	}

	server(id: string) {
		return this.client.guilds.get(id)
	}

	login() {
		return this.client.login(this.config.token)
				.catch(console.error)
				.then(() => {
					console.log(`Bot with ID ${this.client.user.id} is now online`)
				})
	}

	call(...args: any[]) {
		return this.hooks.call.apply(this.hooks, args)
	}

	addHook(...args: any[]) {
		return this.hooks.add.apply(this.hooks, args)
	}

	addSingleHook(...args: any[]) {
		return this.hooks.single.apply(this.hooks, args)
	}

	registerHooks(hookSystem = this.hooks) {
		for (const map of DefaultHooksMap) {
			this.client.on(map[0], (...args: any[]) => {
				args.unshift(map[1])
				this.hooks.call.apply(this.hooks, args)
			})
		}
	}
}

export {BotInstance, DefaultHooksMap}
