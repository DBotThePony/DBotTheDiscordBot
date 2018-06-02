
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

import {CommandBase, CommandExecutionInstance, ImageCommandBase, RegularImageCommandBase} from '../CommandBase'
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')
import { EMOJI_REGEXP_BASE, EMOJI_FUNCS } from '../../lib/Emoji';

const globalExp = new RegExp('\\!?(<:[^:]+:[0-9]+>|' + EMOJI_REGEXP_BASE + ')', 'gi')
const discordEmoteExp = /<:[^:]+:([0-9]+)>/

// `https://cdn.discordapp.com/emojis/.png?v=1`

interface EmoteData {
	invert: boolean
	path: string | null
	url: string | null
}

class EmoteCommand extends ImageCommandBase {
	help = 'Posts emotes sequence as image'
	args = '[!]<emote(s)>'

	constructor() {
		super('e', 'emote', 'emoji', 'epost')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.hasPermissionBoth('ATTACH_FILES')) {
			instance.reply('No rights to attach files!')
			return
		}

		if (!instance.assert(1)) {
			return
		}

		const matchThings = instance.raw.match(globalExp)

		if (matchThings == null) {
			instance.reply('None emojis were detected!')
			return
		}

		const pathes: EmoteData[] = []
		let I = 0
		let hasCustom = false

		const continueWork = () => {
			const magikArgs: string[] = [
				'canvas:transparent',
				'-background', 'transparent',
				'-alpha', 'on',
			]

			for (const path of pathes) {
				magikArgs.push(
					'(',
						path.path!,
						'-resize', 'x512',
				)

				if (path.invert) {
					magikArgs.push('-flop')
				}

				magikArgs.push(')')
			}

			magikArgs.push('+append', 'png:-')

			this.convert(instance, ...magikArgs)
			.then((buffer) => {
				instance.reply('', new Discord.Attachment(buffer, 'emotes.png'))
			})
		}

		for (let thing of matchThings) {
			let invert = false

			if (thing.substr(0, 1) == '!') {
				invert = true
				thing = thing.substr(1)
			}

			if (EMOJI_FUNCS.is(thing)) {
				pathes[I] = {
					'invert': invert,
					path: EMOJI_FUNCS.mapOnDisk(thing),
					url: null
				}

				I++
			} else {
				const ID = thing.match(discordEmoteExp)

				if (ID) {
					hasCustom = true

					pathes[I] = {
						'invert': invert,
						path: null,
						url: `https://cdn.discordapp.com/emojis/${ID[1]}.png?v=1`
					}
				}

				I++
			}
		}

		if (pathes.length >= 40) {
			instance.reply('Too many emotes!')
			return
		}

		if (hasCustom) {
			let images = 0

			for (const path of pathes) {
				if (path.url) {
					images++

					instance.loadImage(path.url).then((path2) => {
						path.path = path2
						images--

						if (images == 0) {
							continueWork()
						}
					})
				}
			}
		} else {
			continueWork()
		}
	}
}

export {EmoteCommand}
