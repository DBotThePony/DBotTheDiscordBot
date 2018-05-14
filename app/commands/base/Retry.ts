
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

import {CommandBase, CommandExecutionInstance} from '../CommandBase'
import {CommandContext} from '../CommandContext'
import {CommandHolder} from '../CommandHolder'

class Retry extends CommandBase {
	allowPipes = false
	help = 'Re-executes previous command (based on CommandContext, but creates new CommandExecutionInstance)'
	canBeBanned = false
	rememberContext = false

	constructor() {
		super('retry')
	}

	executed(instance: CommandExecutionInstance) {
		if (!this.bot) {
			throw new Error('Bad bot instance')
		}

		const context = this.bot.commands.lastContextChannel(instance.channel, instance.author)

		if (!context) {
			instance.reply('There isn\'t any command executed previously!')
			return
		}

		const command = context.getCommand()

		if (!command) {
			return true // what
		}

		const commandObject = this.bot.commands.get(command)

		if (!commandObject) {
			return true // wtf
		}

		commandObject.execute(context)
		return true
	}
}

export {Retry}
