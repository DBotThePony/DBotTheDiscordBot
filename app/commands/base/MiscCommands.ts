
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

class Invite extends CommandBase {
	help = 'Invite link'

	constructor(holder: CommandHolder) {
		super(holder, 'invite')
	}

	executed(instance: CommandExecutionInstance) {
		return 'Link https://discordapp.com/api/oauth2/authorize?client_id=' + this.bot.id + '&scope=bot&permissions=0\nJoin https://discord.gg/HG9eS79';
	}
}

export {Invite}
