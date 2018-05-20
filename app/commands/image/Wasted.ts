
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
import { ImageIdentify } from '../../../lib/imagemagick/Identify';

class WastedCommand extends RegularImageCommandBase {
	help = 'wasted'
	allowUsers = true
	args = '<target>'

	constructor(public toptext = 'wasted', public bottomtext = '') {
		super(toptext.toLowerCase())
	}

	doImage(instance: CommandExecutionInstance, identify: ImageIdentify, w: number, h: number) {
		let signHeight = Math.min(w!, h!) / 7
		let pointsize = signHeight * 0.85

		if (this.bottomtext != '') {
			signHeight *= 1.2
		}

		const image: string[] = [
			identify.path!, '-resize', '2048x2048>', '-resize', '512x512<',
			'-color-matrix', '.3 .1 .3 .3 .1 .3 .3 .1 .3', '-fill', 'rgba(0,0,0,0.5)',

			'-draw', 'rectangle 0, ' + (h! / 2 - signHeight / 2) + ', ' + w + ', ' + (h! / 2 + signHeight / 2),

			'-gravity', 'South',
			'-font', 'PricedownBl-Regular',
			'-weight', '300',
		]

		let textpos = Math.floor(h! / 2 - signHeight * .45)

		if (this.bottomtext != '') {
			image.push(
				'-fill', 'rgb(200,200,200)',
				'-pointsize', String(pointsize * 0.43),
				'-draw', 'text 0,' + (Math.floor(h! / 2 - signHeight * .45)) + ' "' + this.bottomtext + '"',
				'-gravity', 'North'
			)

			pointsize *= 0.9
			textpos -= h! * 0.025
		}

		image.push(
			'-fill', 'rgb(200,30,30)',
			'-stroke', 'black',
			'-strokewidth', String(Math.floor(Math.min(w!, h!) / 400)),

			'-pointsize', String(pointsize),
			'-draw', 'text 0,' + textpos + ' "' + this.toptext + '"',
			'png:-'
		)

		this.convert(instance, ...image)
		.then((value) => {
			instance.reply('', new Discord.Attachment(value!, 'wasted.png'))
		})
	}
}

class YouDied extends RegularImageCommandBase {
	help = 'forsenPls YOU DIED forsenPls'
	allowUsers = true
	args = '<target>'

	constructor() {
		super('youdied', 'dead', 'ded', 'youareded', 'youaredead', 'darksouls')
	}

	doImage(instance: CommandExecutionInstance, identify: ImageIdentify, w: number, h: number) {
		let signHeight = Math.min(w!, h!) / 7
		let pointsize = signHeight

		const image: string[] = [
			identify.path!, '-resize', '2048x2048>', '-resize', '512x512<',
			'-color-matrix', '.3 .1 .3 .3 .1 .3 .3 .1 .3', '-fill', 'rgba(0,0,0,0.05)',
		]

		const internsShadowCount = Math.floor(signHeight / 4)

		for (let i = internsShadowCount; i >= 0; i--) {
			image.push('-draw', 'rectangle 0, ' + (h! / 2 - signHeight / 2 - i) + ', ' + w! + ', ' + (h! / 2 + signHeight / 2 + i));
		}

		image.push(
			'-gravity', 'South',
			'-font', 'OptimusPrinceps',

			'-fill', 'rgb(160,30,30)',
			'-stroke', 'black',
			'-strokewidth', String(Math.floor(Math.min(w!, h!) / 400)),

			'-pointsize', String(pointsize),
			'-draw', 'text 0,' + Math.floor(h! / 2 - signHeight * .55) + ' "YOU DIED"',
			'png:-'
		)

		this.convert(instance, ...image)
		.then((value) => {
			instance.reply('', new Discord.Attachment(value!, 'wasted.png'))
		})
	}
}

export {WastedCommand, YouDied}
