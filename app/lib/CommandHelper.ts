
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

import {BotInstance} from '../BotInstance'
import Discord = require('discord.js')
import { ImageCache } from './ImageCache';
import fs = require('fs')

const imgExt = /.(jpe?g|png|bpg|tiff|bmp)/
const imgExtGif = /.(jpe?g|png|bpg|tiff|bmp|gif)/
const urlMatch = /(https?:[^ ]+)($| )/

class CommandHelper {
	URLHistory = new Map<string, string>()
	IMGHistory = new Map<string, string>()
	IMGHistory2 = new Map<string, string>()
	bot: BotInstance
	cache: ImageCache

	constructor(bot: BotInstance) {
		this.bot = bot
		this.bot.client.on('message', (msg: Discord.Message) => this.onMessage(msg))
		this.cache = new ImageCache(bot)
	}

	onMessage(msg: Discord.Message) {
		const raw = msg.content
		const findURL = raw.match(urlMatch)

		if (findURL) {
			const url = findURL[0]
			this.URLHistory.set(msg.channel.id, url)
			const findIMG = url.match(imgExt)

			if (findIMG) {
				this.IMGHistory.set(msg.channel.id, url)
			}

			const findIMG2 = url.match(imgExtGif)

			if (findIMG2) {
				this.IMGHistory2.set(msg.channel.id, url)
			}
		}
	}

	lastImage(inputArg: Discord.Message | Discord.TextBasedChannelFields) {
		if (inputArg instanceof Discord.Message) {
			return this.IMGHistory.get(inputArg.channel.id)
		} else if (inputArg instanceof Discord.DMChannel) {
			return this.IMGHistory.get(inputArg.id)
		} else if (inputArg instanceof Discord.TextChannel) {
			return this.IMGHistory.get(inputArg.id)
		} else if (inputArg instanceof Discord.GroupDMChannel) {
			return this.IMGHistory.get(inputArg.id)
		}
	}

	findImage(inputArg: Discord.Message | Discord.TextBasedChannelFields, arg: any) {
		if (typeof arg == 'string') {
			const matchurl = arg.match(urlMatch)

			if (matchurl && matchurl[0].match(imgExt)) {
				return matchurl[0]
			}
		}

		if (typeof arg == 'object' && arg instanceof Discord.User) {
			return arg.avatarURL
		}

		if (typeof arg == 'object' && arg instanceof Discord.GuildMember) {
			return arg.user.avatarURL
		}

		return this.lastImage(inputArg)
	}

	loadImage(urlIn: string) {
		return this.cache.download(urlIn)
	}

	loadBufferImage(urlIn: string): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			this.cache.download(urlIn)
			.then((path) => {
				fs.readFile(path, {encoding: null}, (err, data) => {
					if (err) {
						reject(err)
						return
					}

					resolve(data)
				})
			})
			.catch(err => reject(err))
		})
	}
}

export {CommandHelper, imgExt, imgExtGif, urlMatch}
