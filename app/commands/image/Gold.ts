
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

class GoldCommand extends ImageCommandBase {
	help = 'we need more gold'
	args = '<text>'

	constructor() {
		super('gold')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.hasPermissionBoth('ATTACH_FILES')) {
			instance.reply('No rights to attach files!')
			return
		}

		if (!instance.assert(1)) {
			return
		}

		const esc = this.escapeText('+' + instance.raw)

		const magikArgs = [
			'./resource/files/wc3.jpg',
			'-gravity', 'center',
			'-pointsize', '48',

			'-draw', 'fill gold text 0,-50 ' + esc + ' fill rgba(255,215,0,0.6) text 0,-180 ' + esc + ' fill rgba(255,215,0,0.3) text 0,-300 ' + esc,

			'png:-'
		]

		this.convert(instance, ...magikArgs)
		.then((buffer) => {
			instance.send('', new Discord.Attachment(buffer, 'gold.png'))
		})
	}
}

export {GoldCommand}
