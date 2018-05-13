
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

let avaliableCategories: string[]
const defCategories: string[] = []
const defCategoriesIndex = new Map<string, string[]>()

fs.readdir('./resource/fortune/', (err, files) => {
	avaliableCategories = files

	for (const file of files) {
		const target: string[] = []
		defCategoriesIndex.set(file, target)

		fs.readFile('./resource/fortune/' + file, {encoding: 'utf8'}, (err, data) => {
			const lines = data.split(/%\r?\n/)

			for (const line of lines) {
				defCategories.push(line)
				target.push(line)
			}
		})
	}
})

let avaliableCategoriesVulgar: string[]
const vulgarCategories: string[] = []
const vulgarCategoriesIndex = new Map<string, string[]>()

fs.readdir('./resource/fortune_vulgar/', (err, files) => {
	avaliableCategoriesVulgar = files

	for (const file of files) {
		const target: string[] = []
		vulgarCategoriesIndex.set(file, target)

		fs.readFile('./resource/fortune_vulgar/' + file, {encoding: 'utf8'}, (err, data) => {
			const lines = data.split(/%\r?\n/)

			for (const line of lines) {
				vulgarCategories.push(line)
				target.push(line)
			}
		})
	}
})

class Fortune extends CommandBase {
	help = ':$ fortune [category]'

	constructor() {
		super('fortune')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.get(1)) {
			instance.reply('```\n' + defCategories[Math.floor(Math.random() * (defCategories.length - 1))] + '```')
			return
		}

		const category = (<string> instance.get(1)).toLowerCase()

		if (!defCategoriesIndex.has(category)) {
			instance.error('Invalid category. Valid are: ' + avaliableCategories.join(', '), 1)
			return
		}

		const list = <string[]> defCategoriesIndex.get(category)
		instance.reply('```\n' + list[Math.floor(Math.random() * (list.length - 1))] + '```')
	}
}

class VulgarFortune extends CommandBase {
	help = ':$ fortune [category]'

	constructor() {
		super('vfortune', 'vulgarfortune', 'vulgar_fortune')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.get(1)) {
			instance.reply('```\n' + vulgarCategories[Math.floor(Math.random() * (defCategories.length - 1))] + '```')
			return
		}

		const category = (<string> instance.get(1)).toLowerCase()

		if (!vulgarCategoriesIndex.has(category)) {
			instance.error('Invalid category' + avaliableCategoriesVulgar.join(', '), 1)
			return
		}

		const list = <string[]> vulgarCategoriesIndex.get(category)
		instance.reply('```\n' + list[Math.floor(Math.random() * (list.length - 1))] + '```')
	}
}

const uniqueStr = '\x001\x001\x002'
const uniqueStrExp = new RegExp(uniqueStr, 'g')
const copyPastaDict: string[] = []

for (const str of fs.readFileSync('./resource/copypasta.csv', {encoding: 'utf8'}).replace(/""/g, uniqueStr).split(/"([^"]*)"/g)) {
	const result = str.trim().replace(uniqueStrExp, '"').replace(/\r?\n/g, '')

	if (result.length != 0) {
		copyPastaDict.push(result)
	}
}

class CopyPasta extends CommandBase {
	help = 'Posts a random quote from http://www.twitchquotes.com/'

	constructor() {
		super('copypasta', 'mfortune', 'tfortune')
	}

	executed(instance: CommandExecutionInstance) {
		instance.reply('```\n' + copyPastaDict[Math.floor(Math.random() * (copyPastaDict.length - 1))] + '```')
	}
}

export {Fortune, VulgarFortune, CopyPasta}
