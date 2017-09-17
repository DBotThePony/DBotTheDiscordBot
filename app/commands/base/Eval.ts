
//
// Copyright (C) 2017 DBot.
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

import {CommandBase, CommandExecutionInstance} from '../CommandBase'
import {CommandContext} from '../CommandContext'
import {CommandHolder} from '../CommandHolder'
import {BotInstance} from '../../BotInstance'

class Eval extends CommandBase {
	helpStrs: string[]
	allowPipes = false
	displayHelp = false
	help = 'Debug'

	constructor(holder: CommandHolder) {
		super(holder, 'eval', 'debug')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.context.isOwner) {
			instance.reply('Not a bot owner')
			return
		}

		try {
			const status = eval(instance.context.rawArgs)
			instance.send('```js\n' + status + '```')
		} catch(err) {
			instance.send('```js\n' + err.stack + '```')
		}
	}
}

export {Eval}
