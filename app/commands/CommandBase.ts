
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

import {CommandContext, CommandFlags} from './CommandContext'
import {CommandHolder} from './CommandHolder'
import {GEventEmitter} from '../../lib/glib/GEventEmitter'
import {InvalidStateException} from '../../lib/Error'
import Discord = require('discord.js')

class CommandExecutionInstance extends GEventEmitter {
	isTyping = false
	wasTyping = false
	messageSent = false
	flushed = false
	context: CommandContext
	command: CommandBase
	currentArg = 0
	errored = false

	get uid() { return this.context.bot.uid }
	get id() { return this.context.author && this.context.author.id }
	get bot() { return this.context.bot }
	get sql() { return this.context.bot.sql }
	get commands() { return this.context.bot.commands }
	get inServer() { return this.context.inServer }
	get isOwner() { return this.context.isOwner }
	get author() { return this.context.author }
	get user() { return this.context.author }
	get sender() { return this.context.author }
	get member() { return this.context.member }
	get helper() { return this.bot.helper }
	get channel() { return this.context.channel }
	get server() { return this.context.server }
	get length() { return this.context.args.length - 1 }
	get raw() { return this.context.rawArgs }
	get isPM() { return this.context.msg && this.context.msg.channel.type == 'dm' }
	hasArguments() { return this.context.hasArguments() }

	constructor(command: CommandBase, context: CommandContext) {
		super()
		this.context = context
		this.command = command
		this.thinking(true)
	}

	hasPermission(permission: Discord.PermissionResolvable | Discord.PermissionResolvable[]) {
		if (this.isPM) {
			return true // maybe
		}

		if (this.server && this.server.me.hasPermission('ADMINISTRATOR')) {
			return true
		}

		if (this.channel && this.server) {
			const perms = (<Discord.TextChannel> this.channel).permissionsFor(this.server.me)

			if (perms) {
				return perms.has(permission)
			} else {
				return this.server.me.hasPermission(permission)
			}
		}

		return false
	}

	hasPermissionExecutor(permission: Discord.PermissionResolvable | Discord.PermissionResolvable[]) {
		if (this.isPM) {
			return true // maybe
		}

		if (this.isOwner) {
			return true
		}

		if (this.member && this.member.hasPermission('ADMINISTRATOR')) {
			return true
		}

		if (this.channel && this.server && this.member) {
			const perms = (<Discord.TextChannel> this.channel).permissionsFor(this.member)

			if (perms) {
				return perms.has(permission)
			} else {
				return this.member.hasPermission(permission)
			}
		}

		return false
	}

	hasPermissionBoth(permission: Discord.PermissionResolvable | Discord.PermissionResolvable[]) {
		if (this.isPM) {
			return true // maybe
		}

		if (this.server && this.server.me.hasPermission('ADMINISTRATOR') && (this.isOwner || this.member && this.member.hasPermission('ADMINISTRATOR'))) {
			return true
		}

		if (this.channel && this.server && this.member) {
			const perms = (<Discord.TextChannel> this.channel).permissionsFor(this.server.me)
			const perms2 = (<Discord.TextChannel> this.channel).permissionsFor(this.member)

			if (perms) {
				return perms.has(permission) && perms2.has(permission)
			} else {
				return this.server.me.hasPermission(permission) && this.member.hasPermission(permission)
			}
		}

		return false
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

	findImage(arg: any): string | null {
		if (typeof arg == 'object' && arg instanceof Discord.User) {
			return arg.avatarURL
		}

		if (typeof arg == 'string') {
			return this.bot.helper.findImageString(arg)
		}

		if (this.channel) {
			return this.bot.helper.findImage(this.channel, arg) || null
		}

		return null
	}

	loadImage(urlIn: string) {
		const promise = this.bot.helper.loadImage(urlIn)

		promise.catch((err: string) => {
			this.reply('Image download failed: ```\n' + err + '\n```')
		})

		return promise
	}

	loadBufferImage(urlIn: string) {
		const promise = this.bot.helper.loadBufferImage(urlIn)

		promise.catch((err: string) => {
			this.send('Image download failed: ' + err)
		})

		return promise
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

		if (this.messageSent) {
			if (this.isTyping) {
				this.context.typing(false)
			}

			return
		}

		if (this.isTyping) {
			this.context.typing(true)
			return
		}

		if (!this.wasTyping) {
			this.thinking(true)
		}
	}

	send(content: string, attach?: Discord.Attachment | Discord.MessageOptions): Promise<Discord.Message | Discord.Message[]> | null {
		if (this.errored) {
			return null
		}

		if (this.emit('send', content) != undefined) { return null }

		const promise = this.context.send(content, attach)

		if (!promise) {
			return null
		}

		if (this.isTyping) {
			this.thinking(false)
		}

		this.messageSent = true

		return promise
	}

	say(content: string, attach?: Discord.Attachment | Discord.MessageOptions) {
		return this.send(content, attach)
	}

	reply(content: string, attach?: Discord.Attachment | Discord.MessageOptions) {
		return this.isPM ? this.send(content, attach) : this.send('<@' + this.id + '>, ' + content, attach)
	}

	sendPM(content: string) {
		if (this.errored) {
			return false
		}

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
		return this.context.parsedArgs[argNum]
	}

	from(argNum: number): any[] {
		if (!this.has(argNum)) {
			return []
		}

		const output: string[] = []

		for (let i = argNum; i < this.context.parsedArgs.length; i++) {
			output.push(this.context.parsedArgs[i])
		}

		return output
	}

	has(argNum: number) {
		return this.context.parsedArgs[argNum] != undefined && this.context.parsedArgs[argNum] != null
	}

	selectUser(slotIn = 1, ifNone: Discord.User | null = this.author, strict = true): Discord.User | null {
		if (!this.command.allowUsers) {
			throw new InvalidStateException('Command do not accept users', 'allowUsers', true, this.command.allowUsers)
		}

		if (!this.has(slotIn)) {
			return ifNone
		}

		if (strict && !(this.get(slotIn) instanceof Discord.User)) {
			this.error('Invalid user argument', slotIn)
			return null
		}

		return this.get(slotIn)
	}

	assert(argNum: number, reason?: string) {
		if (!this.has(argNum)) {
			this.error(reason || 'Missing argument at ' + argNum, argNum)
			return false
		}

		return true
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

	query(query: string) {
		if (!this.bot || !this.bot.db) {
			throw new Error('No bot or no database avaliable')
		}

		const promise = this.bot.db.query(query)

		promise.catch((err) => {
			this.send('```sql\nSQL Execution error - ' + err + '```')
			console.error(this.command.id + ' sql query errored: ' + err)
			this.errored = true
		})

		return promise
	}
}

class CommandBase implements CommandFlags {
	id: string
	alias: string[]
	help = ''
	args = ''
	executedTimes = 0
	holder!: CommandHolder
	displayHelp = true

	allowUsers = false
	allowMembers = false
	allowRoles = false
	allowChannels = false
	allowPipes = true
	allowPM = true
	onlyPM = false
	canBeBanned = true
	rememberContext = true

	get bot() { return this.holder.bot }
	get sql() { return this.holder.bot.sql }
	get client() { return this.holder.bot.client }

	constructor(id: string | string[], ...aliases: string[]) {
		if (typeof id == 'object') {
			this.id = id[0]
			id.splice(0, 1)
			this.alias = id

			for (const obj of aliases) {
				this.alias.push(obj)
			}
		} else {
			this.id = id
			this.alias = aliases || []
		}
	}

	addAlias(...aliases: string[]) {
		for (const obj of aliases) {
			this.alias.push(obj)
		}
	}

	setHolder(holder: CommandHolder) {
		this.holder = holder
		this.setupBot(holder.bot)
		return this
	}

	setupBot(bot: BotInstance) {

	}

	antispam(user: Discord.User, msg: Discord.Message) {
		return 1
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
		const instance = new CommandExecutionInstance(this, context)

		if (this.onlyPM && !instance.isPM) {
			instance.reply('This command can be only executed in Direct messaging channel (PM/Private Messaging)')
			return false
		}

		if (!this.allowPM && instance.isPM) {
			instance.reply('This command can not be executed in Direct messaging channel (PM/Private Messaging)')
			return false
		}

		this.executedTimes++

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

import child_process = require('child_process')
import { BotInstance } from '../BotInstance';
import { ImageIdentify } from '../../lib/imagemagick/Identify';
const spawn = child_process.spawn

const reconstructBuffer = (buffers: Buffer[]) => {
	let bufferSize = 0

	for (const buffer of buffers) {
		bufferSize += buffer.byteLength
	}

	const newBuffer = Buffer.alloc(bufferSize)
	let offset = 0

	// the fuck node? I want .extend(Buffer) or .append(Buffer | BytesArray) or even better .write(Buffer, offset, length)
	for (const buffer of buffers) {
		for (let i = 0; i < buffer.byteLength; i++) {
			newBuffer[offset + i] = buffer[i]
		}

		offset += buffer.byteLength
	}

	return newBuffer
}

class ImageCommandBase extends CommandBase {
	convertInternal(...args: string[]): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const magick = spawn('convert', args)

			let buffers: Buffer[] = []

			magick.on('close', (code: number, signal: string) => {
				if (code != 0) {
					reject('Image magick exited with non zero code! (' + code + ')')
					return
				}

				if (buffers.length == 0) {
					reject('Image magick did not gave the picture output')
					return
				}

				resolve(reconstructBuffer(buffers))
			})

			magick.stdout.on('data', (chunk: Buffer) => {
				buffers.push(chunk)
			})

			magick.stderr.pipe(process.stderr)
		})
	}

	convertInOutInternal(bufferIn: Buffer, ...args: string[]): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const magick = spawn('convert', args)

			let buffers: Buffer[] = []

			magick.on('close', (code: number, signal: string) => {
				if (code != 0) {
					reject('Image magick exited with non zero code! (' + code + ')')
					return
				}

				if (buffers.length == 0) {
					reject('Image magick did not gave the picture output')
					return
				}

				resolve(reconstructBuffer(buffers))
			})

			magick.stdout.on('data', (chunk: Buffer) => {
				buffers.push(chunk)
			})

			magick.stderr.pipe(process.stderr)
			magick.stdin.end(bufferIn)
		})
	}

	convert(instance: CommandExecutionInstance, ...args: string[]): Promise<Buffer | null> {
		const promise = this.convertInternal(...args)

		promise.catch((err) => {
			instance.reply(err)
		})

		return promise
	}

	identify(instance: CommandExecutionInstance, pathToFile: string): Promise<ImageIdentify> {
		const promise = new ImageIdentify(pathToFile).identify()

		promise.catch((err) => {
			instance.reply('```\n' + err + '\n```')
		})

		return promise
	}

	convertInOut(instance: CommandExecutionInstance, bufferIn: Buffer, ...args: string[]): Promise<Buffer | null> {
		const promise = this.convertInOutInternal(bufferIn, ...args)

		promise.catch((err) => {
			instance.reply(err)
		})

		return promise
	}

	escapeText(textIn: string) {
		return `"${textIn.replace(/\\/gi, '\\\\').replace(/"/, '\\"')}"`
	}
}

// todo: RegularMultiImageCommandBase (when needed)
class RegularImageCommandBase extends ImageCommandBase {
	forceClamp = true
	clampMinWidth = 512
	clampMinHeight = 512
	clampMaxWidth = 2048
	clampMaxHeight = 2048
	allowWildRatio = false
	onlyStatic = true

	doImage(instance: CommandExecutionInstance, identify: ImageIdentify, w?: number, h?: number) {

	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.hasPermissionBoth('ATTACH_FILES')) {
			instance.reply('No rights to attach files!')
			return
		}

		const image = instance.findImage(instance.next())

		if (!image) {
			instance.error('Invalid image provided', 1)
			return
		}

		instance.loadImage(image)
		.then((path) => {
			this.identify(instance, path)
			.then((value) => {
				if (this.onlyStatic && !value.isStatic) {
					instance.reply('Image is not a static image!')
					return
				}

				if (!this.allowWildRatio && value.wildAspectRatio) {
					instance.reply('Image has wild aspect ratio')
					return
				}

				if (this.forceClamp) {
					const [w, h] = value.clamp(this.clampMinWidth, this.clampMinHeight, this.clampMaxWidth, this.clampMaxHeight)

					if (!w && !h) {
						instance.reply('Image has wild aspect ratio')
						return
					}

					this.doImage(instance, value, w!, h!)
				} else {
					this.doImage(instance, value)
				}
			})
		})
	}
}

export {CommandBase, ImageCommandBase, CommandExecutionInstance, RegularImageCommandBase}
