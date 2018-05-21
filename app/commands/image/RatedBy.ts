
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

class RatedByCommand extends ImageCommandBase {
	help = 'rated by U'
	args = '<top text> <age string/number> <commentary 1> [...commentaries]'

	constructor() {
		super('ratedby')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.hasPermissionBoth('ATTACH_FILES')) {
			instance.reply('No rights to attach files!')
			return
		}

		if (!instance.assert(1, 'Top text is needed')) {
			return
		}

		if (!instance.assert(2, 'Age is needed')) {
			return
		}

		if (!instance.assert(3, 'At least one commentary is required')) {
			return
		}

		let toptext = <string> instance.get(1)
		let agestring = <string> instance.get(2)
		let commentaries = <string[]> instance.from(3)

		const parseAge = parseInt(agestring)

		if (parseAge == parseAge && String(parseAge).length == agestring.length) {
			agestring = agestring + '+™'
		}

		const magikArgs: string[] = [
			'-size', '640x350',
			'canvas:black',
			'-background', 'black',
			'-fill', 'white',

			'-draw', 'rectangle 3,3 637,6',
			'-draw', 'rectangle 3,3 6,347',
			'-draw', 'rectangle 6,347 637,344',
			'-draw', 'rectangle 637,6 634,344',
			'-draw', 'rectangle 15,40 195,300',
			'-draw', 'rectangle 205,40 625,300',

			'-font', 'BebasNeue',
			'-gravity', 'NorthWest',
			'-pointsize', '36',
			'-draw', 'text 15,4 ' + this.escapeText(toptext),

			'-gravity', 'NorthEast',
			'-draw', 'text 10,4 ' + this.escapeText(agestring),

			'-gravity', 'NorthWest',
			'-draw', 'text 15,300 "' + (instance.member && instance.member.nickname || instance.author!.username) + '\'s CONTENT RATING"',

			'-pointsize', '300',
			'-fill', 'black',
			'-draw', 'rotate -20 text 10,40 "' + toptext.substr(0, 1) + '"',
			'-pointsize', '36',
		]

		let i = 0

		for (const arg of commentaries) {
			magikArgs.push('-draw', 'text 220,' + (40 + i * 28) + ' ' + this.escapeText(arg))
			i++
		}

		magikArgs.push('png:-')

		this.convert(instance, ...magikArgs)
		.then((buff) => {
			instance.reply('', new Discord.Attachment(buff!, 'ratedby.png'))
		})
	}
}

export {RatedByCommand}
