
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
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')
import {sprintf} from 'sprintf-js'
import { CommandHelper } from '../../lib/CommandHelper';

class UserWithUserCommand extends CommandBase {
	fstring: string
	allowUsers = true
	actionID: number

	constructor(holder: CommandHolder, commName: string, fstring: string, help = commName) {
		super(holder, commName)
		this.fstring = fstring
		this.help = help
		const botUnlocked = <any> this.bot
		botUnlocked.nextActionID = (botUnlocked.nextActionID || 0) + 1
		this.actionID = botUnlocked.nextActionID
	}

	executed(instance: CommandExecutionInstance) {
		let actor = <Discord.User> instance.user
		let targetUser = <Discord.User> instance.next()

		if (!targetUser) {
			targetUser = actor
			actor = this.bot.client.user
		}

		if (typeof targetUser != 'object') {
			instance.error('Not a user!', 1)
			return
		}

		instance.query(`INSERT INTO "roleplay" VALUES ('${actor.id}', '${targetUser.id}', '${this.actionID}', '1') ON CONFLICT
		("actor", "target", "action") DO UPDATE SET "times" = "roleplay"."times" + 1 RETURNING "times"`).then((data) => {
			instance.say('_' + sprintf(this.fstring, `<@${actor.id}>`, `<@${targetUser.id}>`) + ` (${data && data.rows[0] && data.rows[0].times} times in total)_`)
		})
	}
}

const RegisterRPActions = function(holder: CommandHolder) {
	holder.registerCommand(new UserWithUserCommand(holder, 'hug', '%s hugs %s', 'hugs? ^w^'))
}

export {RegisterRPActions}
