
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

class GachiPls extends ImageCommandBase {
	help = 'DETH'
	args = '<text>'

	constructor() {
		super('gachipls')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.hasPermissionBoth('ATTACH_FILES')) {
			instance.reply('No rights to attach files!')
			return
		}

		if (!instance.assert(1)) {
			return
		}

		const magikArgs = [
			'-background', '#0B0B05',

			'(',
				'(',
					'-size', '112x112',
					'canvas:transparent',
				')',

				'-size', 'x112',
				'canvas:transparent',
				'-fill', '#62A0E0',
				'-family', 'PT Sans',
				'-style', 'Normal',
				'label:' + this.escapeLiterals(instance.raw),

				'+append',

			')',

			'-repage', '0x0',
			'null:',

			'(',
				'./resource/files/gachipls.gif',
				'-coalesce',
			')',

			'-alpha', 'off',

			'-compose', 'Over', '-layers', 'composite', '-layers', 'optimize',

			'gif:-'
		]

		this.convert(instance, ...magikArgs)
		.then((buffer) => {
			instance.reply('', new Discord.Attachment(buffer, 'gachi.gif'))
		})
	}
}

export {GachiPls}
