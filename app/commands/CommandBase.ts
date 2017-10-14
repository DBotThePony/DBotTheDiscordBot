
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

import {CommandContext, CommandFlags} from './CommandContext'
import {CommandHolder} from './CommandHolder'
import {GEventEmitter} from '../../lib/glib/GEventEmitter'

class CommandExecutionInstance extends GEventEmitter {
	isTyping = false
	wasTyping = false
	flushed = false
	context: CommandContext
	command: CommandBase
	currentArg = 0

	get uid() { return this.context.bot.uid }
	get id() { return this.context.author && this.context.author.id }
	get bot() { return this.context.bot }
	get commands() { return this.context.bot.commands }
	get inServer() { return this.context.inServer }
	get author() { return this.context.author }
	get user() { return this.context.author }
	get sender() { return this.context.author }
	get helper() { return this.bot.helper }
	get channel() { return this.context.channel }
	get server() { return this.context.server }
	hasArguments() { return this.context.hasArguments() }

	constructor(command: CommandBase, context: CommandContext) {
		super()
		this.context = context
		this.command = command
		this.thinking(true)
	}

	buildError(message: string, argNum: number) {
		let buildString = 'Error - ' + message + '\n```' + this.command.id + ' '
		let spacesLen = this.command.id.length
		let uppersLen = 0
		argNum--

		for (let i2 = 1; i2 <= Math.max(argNum, this.context.parsedArgs.length - 1) + 1; i2++) {
			const arg = this.context.parsedArgs[i2] || '<missing>'
			buildString += arg + ' '
			if (i2 < argNum) {
				spacesLen += arg.length
			} else {
				uppersLen = arg.length
				break
			}
		}

		buildString += '\n' + ' '.repeat(spacesLen) + ' ' + '^'.repeat(uppersLen) + '```\n' +
			'Help:\n```' + this.command.id + ' ' + this.command.args + (this.command.hasHelp() && ('\n' + this.command.help) || '') + '```'

		return buildString
	}

	error(message: string, argNum: number) {
		this.send(this.buildError(message, argNum))
	}

	thinking(status = false) {
		if (this.isTyping != status) {
			if (this.flushed) { this.context.typing(status) }
			this.wasTyping = true
		}

		this.isTyping = status
	}

	findImage(arg: any) {
		if (this.channel) {
			return this.bot.helper.findImage(this.channel, arg)
		}
	}

	loadImage(urlIn: string) {
		return this.bot.helper.loadImage(urlIn).catch((err: string) => {
			this.send('Image download failed: ' + err)
		})
	}

	argument(num: number) {
		return this.context.parsedArgs[num]
	}

	destroy() {
		this.flush()

		if (this.isTyping) {
			this.thinking(false)
		}
	}

	flush() {
		this.flushed = true

		if (this.isTyping) {
			this.context.typing(true)
		}

		if (!this.wasTyping) {
			this.thinking(true)
		}
	}

	send(content: string) {
		if (this.emit('send', content) != undefined) { return false }

		this.context.send(content)

		if (this.isTyping) {
			this.thinking(false)
		}

		return true
	}

	reply(content: string) {
		return this.send('<@' + this.id + '>, ' + content)
	}

	sendPM(content: string) {
		if (this.emit('sendPM', content) != undefined) { return false }

		if (!this.context.user) {
			return false
		}

		this.context.user.send(content)

		if (this.isTyping) {
			this.thinking(false)
		}

		return true
	}

	next() {
		this.currentArg++
		return this.context.parsedArgs[this.currentArg]
	}

	get(argNum: number) {
		return this.context.parsedArgs[argNum + 1]
	}

	reset() {
		this.currentArg = 0
		return this
	}

	*[Symbol.iterator] () {
		for (let i = 1; i < this.context.parsedArgs.length; i++) {
			yield [i, this.context.parsedArgs[i]]
		}
	}
}

class CommandBase implements CommandFlags {
	id: string
	alias: string[]
	help = ''
	args = ''
	executedTimes = 0
	holder: CommandHolder
	displayHelp = true

	allowUsers = false
	allowMembers = false
	allowRoles = false
	allowChannels = false
	allowPipes = true

	get bot() { return this.holder.bot }
	get client() { return this.holder.bot.client }

	constructor(holder: CommandHolder, id: string, ...aliases: string[]) {
		this.id = id
		this.alias = aliases || []
		this.holder = holder
	}

	hasHelp() {
		return this.help != ''
	}

	getArgumentsString() {
		if (this.hasArguments()) {
			return this.args
		} else {
			return ''
		}
	}

	hasArguments() {
		return this.args != ''
	}

	hasAlias() {
		return this.alias && this.alias.length > 0
	}

	execute(context: CommandContext) {
		this.executedTimes++
		const instance = new CommandExecutionInstance(this, context)

		try {
			const status = this.executed(instance)

			if (typeof status == 'string') {
				instance.send(status)
			} else if (typeof status == 'boolean') {
				return status
			} else {
				instance.flush()
			}
		} catch(err) {
			instance.send('```js\n' + err.stack + '```')
			console.error('User ' + context.author + ' executed ' + context.getCommand() + ' and it errored:')
			console.error(err)
			instance.destroy()
		}

		return true
	}

	// override
	executed(instance: CommandExecutionInstance) {

	}
}

export {CommandBase, CommandExecutionInstance}
