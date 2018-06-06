
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

import Discord = require('discord.js')
import {ParseString} from '../../lib/StringUtil'
import {BotInstance} from '../BotInstance'

const parseUser = /<@!?([0-9]+)>/
const parseRole = /<&([0-9]+)>/
const parseChannel = /<#([0-9]+)>/

interface CommandFlags {
	allowUsers: boolean
	allowMembers: boolean
	allowRoles: boolean
	allowChannels: boolean
	allowPipes: boolean
}

class CommandContext implements CommandFlags {
	msg: Discord.Message | null = null
	author: Discord.User | null = null
	channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel | null = null
	member: Discord.GuildMember | null = null
	self: Discord.GuildMember | null = null
	me: Discord.GuildMember | null = null
	server: Discord.Guild | null = null
	userid: string | null = null
	serverid: string | null = null

	editOn: CommandContext | null = null
	edited = false
	editTarget: Discord.Message | null = null

	raw: string = ''
	private _rawArgs: string = ''
	get rawArgs() { return this.piping && this.rawPipe || this._rawArgs }
	args: string[] = []
	get currentArgs() { return this.piping && this.pipeArguments || this.args }
	argsPipes: string[][] = []
	parsedArgs: any[] = []
	parsed = false
	bot: BotInstance

	allowUsers = false
	allowMembers = false
	allowRoles = false
	allowChannels = false
	allowPipes = true

	piping = false
	pipeid = 0

	messages: Discord.Message[] = []

	get sid() { return this.serverid }
	get uid() { return this.userid }
	get guild() { return this.server }
	get user() { return this.author }
	get sender() { return this.author }
	get inServer() { return this.server != null }
	get isPM() { return this.channel && this.channel.type == 'dm' }
	get isOwner() { return this.uid && this.bot.config.owners.includes(this.uid) || false }
	get inDM() { return typeof this.channel == 'object' && this.channel instanceof Discord.DMChannel }

	constructor(bot: BotInstance, rawInput: string, msg?: Discord.Message) {
		this.raw = rawInput
		this.bot = bot

		if (msg) {
			this.setupMessage(msg)
		}
	}

	setupMessage(msg: Discord.Message) {
		this.args = []
		this.argsPipes = []
		this.parsedArgs = []
		this.parsed = false

		this.msg = msg
		this.author = msg.author
		this.channel = msg.channel
		this.userid = msg.author.id
		this.userid = msg.author.id

		if (msg.guild) {
			this.server = msg.guild
			this.self = msg.guild.me
			this.me = msg.guild.me
			this.member = msg.member
			this.serverid = msg.guild.id
		}
	}

	setEdit(editOn: CommandContext) {
		if (!editOn.canEdit()) {
			throw new Error('Illegal state of CommandContext provided to .setEdit()')
		}

		if (this.messages.length != 0) {
			throw new Error('Already got sent messages!')
		}

		this.editOn = editOn
		this.edited = false
		this.editTarget = editOn.getEditMessage()
	}

	importFlags(flags: CommandFlags) {
		this.allowUsers = flags.allowUsers
		this.allowMembers = flags.allowMembers
		this.allowRoles = flags.allowRoles
		this.allowChannels = flags.allowChannels
		this.allowPipes = flags.allowPipes
	}

	canEdit() {
		return this.messages.length == 1
	}

	getEditMessage(): Discord.Message | null {
		return this.messages[0] || null
	}

	clearAll() {
		const promises = []

		for (const message of this.messages) {
			const promise = message.delete()
			promise.catch(console.error)
			promises.push(promise)
		}

		return promises
	}

	send(content: string, attach?: Discord.Attachment | Discord.MessageOptions): Promise<Discord.Message | Discord.Message[]> | null {
		if (!this.channel) {
			return null
		}

		if (this.editTarget && attach) {
			this.editTarget.delete().catch(console.error)
			this.edited = true
			this.editTarget = null
		}

		if (!this.editTarget) {
			const promise = this.channel.send(content, attach)

			promise.catch(console.error)

			promise.then((message) => {
				if (Array.isArray(message)) {
					for (const m of message) {
						this.messages.push(m)
					}
				} else {
					this.messages.push(message)
				}
			})

			return promise
		} else {
			const promise = this.editTarget.edit(content)

			promise.catch(console.error)

			promise.then((message) => {
				this.messages.push(message)
			})

			return promise
		}
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

	rawPipe = ''
	pipeCommand: string | null = null
	pipeArguments: string[] = []
	originalCommand: string | null = null
	nextpipeid = 0

	pipe(pipeid: number, append: string[], raw: string) {
		this.piping = true
		this.pipeid = pipeid
		this.nextpipeid = pipeid + 1
		const args = this.getPipeArguments(pipeid)

		if (!args) {
			throw new Error('No pipe found with ID ' + pipeid)
		}

		const rawPrev = args.join(' ')
		this.pipeCommand = this.getPipe(pipeid)
		args.push(...append)
		this.rawPipe = (rawPrev + ' ' + raw).trim()
		this.pipeArguments = args
		this.parseFull()

		return this
	}

	getCommand() {
		if (this.piping) {
			return this.pipeCommand
		}

		return this.originalCommand
	}

	parseArgs(strIn: string) {
		if (this.parsed) {
			return this
		}

		this.parsed = true
		const parsedData = ParseString(this.raw)
		this.args = parsedData[0]
		parsedData.splice(0, 1)
		this.originalCommand = this.args[0] && this.args[0].toLowerCase() || null

		if (this.allowPipes) {
			let hit = false

			for (const layer of parsedData) {
				if (layer[0]) {
					const command = layer[0]
					const getcommand = this.bot.commands.get(command.toLowerCase())

					if (getcommand && !getcommand.allowPipes) {
						hit = true
						break
					}
				}
			}

			if (!hit) {
				this.argsPipes = parsedData
			} else {
				for (const obj of parsedData) {
					for (const obj2 of obj) {
						this.args.push(obj2)
					}
				}
			}
		} else {
			for (const obj of parsedData) {
				for (const obj2 of obj) {
					this.args.push(obj2)
				}
			}
		}

		this.rebuildRaw()

		return this
	}

	static patternSafe = /(\+|\|\\|\-|\]|\(|\)|\[])/g

	rebuildRaw() {
		if (this.args[0] && this.allowPipes) {
			//this._rawArgs = this.raw.substr(this.args[0].length + 1)
			let match

			try {
				if (this.args[1]) {
					match = this.raw.match(new RegExp('^' + this.args[0] + '([^|]+)(' + this.args[this.args.length - 1].replace(CommandContext.patternSafe, '\\$1') + ')("?\'?)'))
				} else {
					match = this.raw.match(new RegExp('^' + this.args[0] + '([^|]+)'))
				}

				if (match) {
					this._rawArgs = (match[1] + (match[2] || '') + (match[3] || '')).trim()
				} else {
					this._rawArgs = this.args.join(' ')
				}
			} catch(err) {
				// console.error(err)
				this._rawArgs = this.raw.substr(this.args[0].length + 1)
			}
		} else if (this.args[0]) {
			this._rawArgs = this.raw.substr(this.args[0].length + 1)
		}
	}

	parseFull() {
		this.parsedArgs = []

		for (const i in this.currentArgs) {
			const arg = this.currentArgs[i]

			if (typeof arg != 'string') {
				break
			}

			if (this.allowUsers) {
				const user = arg.match(parseUser)

				if (user) {
					this.parsedArgs[i] = this.bot.client.users.get(user[1]) || arg
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
			}

			if (this.allowMembers && this.server) {
				const user = arg.match(parseUser)

				if (user) {
					this.parsedArgs[i] = this.server.member(user[1]) || arg
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
			}

			if (this.allowChannels) {
				const channel = arg.match(parseChannel)

				if (channel) {
					this.parsedArgs[i] = this.bot.client.channels.get(channel[1]) || arg
					continue
				}
			}

			if (this.allowRoles && this.server) {
				const role = arg.match(parseRole)

				if (role) {
					this.parsedArgs[i] = this.server.roles.get(role[1]) || arg
					continue
				}
			}

			this.parsedArgs[i] = arg
		}

		return this
	}

	getPipe(pipeNum: number): string | null {
		if (!this.argsPipes[pipeNum] || this.argsPipes[pipeNum].length == 0) {
			return null
		}

		return this.argsPipes[pipeNum][0]
	}

	getPipeArguments(pipeNum: number): string[] | null {
		if (!this.argsPipes[pipeNum] || this.argsPipes[pipeNum].length == 0) {
			return null
		}

		const reply = []

		for (let i = 1; i < this.argsPipes[pipeNum].length; i++) {
			reply.push(this.argsPipes[pipeNum][i])
		}

		return reply
	}

	hasPipes() {
		return this.argsPipes.length >= 1
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

export {CommandContext, CommandFlags}
