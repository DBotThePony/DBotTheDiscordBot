
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

import Discord = require('discord.js')
import {ParseString} from '../../lib/StringUtil'
import {BotInstance} from '../BotInstance'
import {GEventEmitter} from '../../lib/glib/GEventEmitter'

const parseUser = /<@([0-9]+)>/
const parseRole = /<&([0-9]+)>/
const parseChannel = /<#([0-9]+)>/

class CommandContext extends GEventEmitter {
	msg: Discord.Message | null = null
	author: Discord.User | null = null
	channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | null = null
	member: Discord.GuildMember | null = null
	self: Discord.GuildMember | null = null
	server: Discord.Guild | null = null
	userid: string | null = null
	serverid: string | null = null

	raw: string = ''
	rawArgs: string = ''
	args: string[] = []
	argsPipes: string[][] = []
	parsedArgs: any[] = []
	parsedPipes: any[][] = []
	parsed = false
	bot: BotInstance

	allowUsers = false
	allowMembers = false
	allowRoles = false
	allowChannels = false
	allowPipes = true
	executed = false

	get sid() { return this.serverid }
	get uid() { return this.userid }
	get guild() { return this.server }
	get user() { return this.author }
	get sender() { return this.author }
	get inServer() { return this.server != null }
	get isOwner() { return this.uid && this.bot.config.owners.includes(this.uid) }
	get inDM() { return typeof this.channel == 'object' && this.channel instanceof Discord.DMChannel }

	constructor(bot: BotInstance, rawInput: string, msg?: Discord.Message) {
		super()
		this.raw = rawInput
		this.bot = bot

		if (msg) {
			this.msg = msg
			this.author = msg.author
			this.channel = msg.channel
			this.userid = msg.author.id
			this.userid = msg.author.id

			if (msg.guild) {
				this.server = msg.guild
				this.self = msg.guild.member(bot.id)
				this.member = msg.member
				this.serverid = msg.guild.id
			}
		}
	}

	send(content: string) {
		if (!this.channel) {
			return null
		}

		const status = this.emit('send', content)

		if (status != undefined) {
			if (typeof status == 'string') {
				return this.channel.send(status)
			}

			return status
		}

		return this.channel.send(content)
	}

	typing(status: boolean) {
		if (!this.msg) {
			return null
		}

		if (status) {
			this.msg.channel.startTyping()
		} else {
			this.msg.channel.stopTyping()
		}

		return this.msg
	}

	getCommand() {
		if (!this.parsed || !this.args[0]) {
			return null
		}

		return this.args[0].toLowerCase()
	}

	parseArgs(strIn: string) {
		this.parsed = true
		const parsedData = ParseString(this.raw)
		this.args = parsedData[0]
		parsedData.splice(0, 1)

		if (this.allowPipes) {
			this.argsPipes = parsedData
		} else {
			for (const obj of parsedData) {
				for (const obj2 of obj) {
					this.args.push(obj2)
				}
			}
		}

		this.parsedArgs = []

		for (const i in this.args) {
			const arg = this.args[i]

			if (this.allowUsers) {
				const user = arg.match(parseUser)

				if (user) {
					this.parsedArgs[i] = this.bot.client.users.get(user[0])
					continue
				} else {
					switch (arg) {
						case '@me':
						case '@myself':
						case '@self':
						case '@user':
						case '%self%':
						case '%me%':
						case '%myself%':
						case '%user%':
							this.parsedArgs[i] = this.author
							break
						case '@bot':
						case '@notdbot':
						case '%bot%':
						case '%notdbot%':
							this.parsedArgs[i] = this.bot.client.user
							break
						case '@owner':
						case '@serverowner':
						case '@server_owner':
						case '%owner%':
						case '%serverowner%':
						case '%server_owner%':
							if (this.server) {
								this.parsedArgs[i] = this.server.owner.user
							}
							break
					}

					if (this.parsedArgs[i]) {
						continue
					}
				}
			} else if (this.allowMembers && this.server) {
				const user = arg.match(parseUser)

				if (user) {
					this.parsedArgs[i] = this.server.member(user[0])
					continue
				} else {
					switch (arg) {
						case '@me':
						case '@myself':
						case '@self':
						case '@user':
						case '%self%':
						case '%me%':
						case '%myself%':
						case '%user%':
							this.parsedArgs[i] = this.member
							break
						case '@bot':
						case '@notdbot':
						case '%bot%':
						case '%notdbot%':
							this.parsedArgs[i] = this.server.member(this.bot.client.user)
							break
						case '@owner':
						case '@serverowner':
						case '@server_owner':
						case '%owner%':
						case '%serverowner%':
						case '%server_owner%':
							if (this.server) {
								this.parsedArgs[i] = this.server.owner
							}
							break
					}

					if (this.parsedArgs[i]) {
						continue
					}
				}
			} else if (this.allowChannels) {
				const channel = arg.match(parseChannel)

				if (channel) {
					this.parsedArgs[i] = channel
					continue
				}
			} else if (this.allowRoles) {
				const role = arg.match(parseRole)

				if (role) {
					this.parsedArgs[i] = role
					continue
				}
			} else {
				this.parsedArgs[i] = arg
			}
		}

		if (this.args[0]) {
			this.rawArgs = this.raw.substr(this.args[0].length)
		}

		return this
	}

	hasArguments() {
		return this.args.length > 1
	}

	*next() {
		for (const arg of this.args) {
			yield arg
		}
	}

	concatArgs(split = ' ') {
		if (!this.parsed) {
			return ''
		}

		return this.args.join(split)
	}

	parse() {
		return this.parseArgs(this.raw)
	}
}

export {CommandContext}
