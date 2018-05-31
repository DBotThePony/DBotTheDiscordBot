
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

import unirest = require('unirest')
import {BotInstance} from '../BotInstance'
import Discord = require('discord.js')
import {URL} from 'url'
import crypto = require('crypto')
import fs = require('fs')
import os = require('os')

const transformBase = (text: string) => text.replace(/\+/g, 'pp').replace(/\//g, 'ss')

class ImageCache {
	bot: BotInstance
	tmpdir: string

	constructor(bot: BotInstance) {
		this.bot = bot
		const subdir = crypto.createHash('sha256').update(bot.config.token).digest('hex').substr(0, 12)
		this.tmpdir = os.tmpdir().replace(/\\/g, '/') + '/' + subdir

		fs.mkdir(this.tmpdir, (err => {
			if (err) {
				// console.error(err)
			}

			console.log('Created tmp directory with ID ' + subdir)
		}))
	}

	transformName(urlIn: string) {
		const transform = new URL(urlIn)
		const hash = crypto.createHash('sha256').update(urlIn)
		const split = transform.pathname.split('/')
		const filenameext = split[split.length - 1]
		const filename = filenameext.match(/([^\.]+)\.(.*)?/)

		if (filename) {
			const file = filename[1]
			const ext = filename[2]
			const sha = transformBase(hash.digest('hex'))
			const tpath = this.tmpdir + '/' + sha.substr(0, 12) + '.' + ext

			return [sha, file, ext, tpath]
		}

		return null
	}

	download(urlIn: string) {
		return new Promise<string>((resolve, reject) => {
			if (urlIn.match(/^\.\/resource\//) && !urlIn.match(/\.\.\//)) {
				resolve(urlIn)
			}

			const identify = this.transformName(urlIn)

			if (!identify) {
				reject('Unable to resolve URL')
				return
			}

			const tpath = identify[3]

			fs.stat(tpath, (err, stats) => {
				if (!stats) {
					unirest.get(urlIn).encoding(null).end((result) => {
						if (result.status != 200) {
							reject('Server replied with non 200 code: `' + result.status + '`')
						} else {
							fs.writeFile(tpath, result.raw_body, {encoding: null}, (err) => {
								if (err) {
									console.error(err)
									reject(err)
								} else {
									resolve(tpath)
								}
							})
						}
					})
				} else {
					resolve(tpath)
				}
			})
		})
	}
}

export {ImageCache}
