
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

import {CommandBase, CommandExecutionInstance, ImageCommandBase} from '../CommandBase'
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')

class WastedCommand extends ImageCommandBase {
	help = 'wasted'
	allowUsers = true
	args = '<target>'

	constructor(public toptext = 'wasted', public bottomtext = '') {
		super('wasted')
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
				if (!value.isStatic) {
					instance.reply('Image is not a static image!')
					return
				}

				if (value.wildAspectRatio) {
					instance.reply('Image has wild aspect ratio')
					return
				}

				const [w, h] = value.clamp(512, 512, 2048, 2048)

				if (!w && !h) {
					instance.reply('Image has wild aspect ratio')
					return
				}

				const signHeight = Math.min(w!, h!) / 7
				let pointsize = signHeight * 0.85

				if (this.bottomtext != '') {
					pointsize /= 2
				}

				const image: string[] = [
					path, '-resize', '2048x2048>', '-resize', '512x512<',
					'-color-matrix', '.3 .1 .3 .3 .1 .3 .3 .1 .3', '-fill', 'rgba(0,0,0,0.5)',

					'-draw', 'rectangle 0, ' + (h! / 2 - signHeight / 2) + ', ' + w + ', ' + (h! / 2 + signHeight / 2),

					'-gravity', 'South',
					'-font', 'PricedownBl-Regular',
					'-fill', 'rgb(200,30,30)',
					'-stroke', 'black',
					'-strokewidth', String(Math.floor(Math.min(w!, h!) / 400)),
					'-weight', '300',

					'-pointsize', String(pointsize),

					'-draw', 'text 0,' + (Math.floor(h! / 2 - signHeight * .45)) + ' "' + this.toptext + '"',
					'png:-'
				]

				this.tryConvert2(instance, ...image)
				.then((value) => {
					instance.reply('', new Discord.Attachment(value!, 'wasted.png'))
				})
			})
		})
	}
}

export {WastedCommand}
