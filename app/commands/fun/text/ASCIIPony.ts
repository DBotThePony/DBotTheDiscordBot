
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

import {CommandBase, CommandExecutionInstance, ImageCommandBase} from '../../CommandBase'
import {CommandHolder} from '../../CommandHolder'
import Discord = require('discord.js')

import fs = require('fs')
const AvaliablePonies: string[] = []
let AvaliablePoniesPNG: string[] = []

fs.readdir('./resource/poni_txt/', (err, files) => {
	for (const file of files) {
		fs.readFile('./resource/poni_txt/' + file, 'utf8', (err, data) => {
			AvaliablePonies.push(data)
		})
	}
})

fs.readdir('./resource/poni/', (err, files) => {
	AvaliablePoniesPNG = files
})

class ASCIIPonyCommand extends CommandBase {
	help = 'Posts an ASCII pone'

	constructor() {
		super('pony', 'pone', 'poneh')
	}

	executed(instance: CommandExecutionInstance) {
		instance.send('```\n' + AvaliablePonies[Math.floor(Math.random() * (AvaliablePonies.length - 1))] + '```')
	}
}

class ASCIIPonyImageCommand extends CommandBase {
	help = 'Posts an ASCII pone as image'

	constructor() {
		super('ipony', 'ipone', 'iponeh')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.hasPermission('ATTACH_FILES')) {
			instance.reply('No rights to post image!')
			return
		}

		const path = AvaliablePoniesPNG[Math.floor(Math.random() * (AvaliablePoniesPNG.length - 1))]

		fs.readFile('./resource/poni/' + path, {encoding: null}, (err, data) => {
			if (err) {
				instance.reply('```\n' + err + '```')
				return
			}

			instance.send('', new Discord.Attachment(data, 'ponie.png'))
		})

	}
}

export {ASCIIPonyCommand, ASCIIPonyImageCommand }
