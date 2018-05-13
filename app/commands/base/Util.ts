
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
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')
import crypto = require('crypto')

class HashCommand extends CommandBase {
	hasher: string
	canBeBanned = false

	constructor(hasher: string) {
		super('hash' + hasher.toLowerCase())
		this.help = 'Hash a text with ' + hasher
		this.hasher = hasher.toLowerCase()
	}

	executed(instance: CommandExecutionInstance) {
		return '```' + crypto.createHash(this.hasher).update(instance.raw).digest('hex') + '```'
	}
}

export {HashCommand}
