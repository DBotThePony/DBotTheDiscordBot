
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
import {CommandContext} from '../CommandContext'
import {CommandHolder} from '../CommandHolder'
import {ParseString} from '../../../lib/StringUtil'
import Discord2 = require('discord.js')
import unirest2 = require('unirest')

const Discord = Discord2
const unirest = unirest2
const ParseString2 = ParseString

class Eval extends ImageCommandBase {
	allowPipes = false
	displayHelp = false
	help = 'Debug'
	canBeBanned = false

	constructor() {
		super('eval', 'debug', 'repl')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.isOwner) {
			instance.reply('Not a bot owner')
			return
		}

		try {
			const status = eval(instance.raw)
			instance.send('```js\n' + status + '```')
		} catch(err) {
			instance.send('```js\n' + err.stack + '```')
			console.log(instance.context.rawArgs, err)
		}
	}
}

export {Eval}
