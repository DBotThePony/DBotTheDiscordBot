
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

class Invite extends CommandBase {
	help = 'Invite link'

	constructor(holder: CommandHolder) {
		super(holder, 'invite')
	}

	executed(instance: CommandExecutionInstance) {
		return 'Link https://discordapp.com/api/oauth2/authorize?client_id=' + this.bot.id + '&scope=bot&permissions=0\nJoin https://discord.gg/HG9eS79';
	}
}

class SetAvatar extends CommandBase {
	help = 'Set bot avatar'
	displayHelp = false
	allowUsers = true

	constructor(holder: CommandHolder) {
		super(holder, 'setavatar')
	}

	executed(instance: CommandExecutionInstance) {
		const img = instance.findImage(instance.next())

		if (!img) {
			instance.error('Nu image? ;n;', 1)
			return
		}

		instance.loadImage(img).then((path: string) => {
			this.bot.client.user.setAvatar(path)
			.catch((err) => {
				instance.send(err)
			}).then(() => {
				instance.reply('Avatar updated successfully')
			})
		})
	}
}

class GetAvatar extends CommandBase {
	help = 'Get user(s) avatar(s)'
	allowUsers = true

	constructor(holder: CommandHolder) {
		super(holder, 'avatar')
	}

	executed(instance: CommandExecutionInstance) {
		let reply = 'Avatars: '

		for (const [i,  user] of instance) {
			if (typeof user != 'object') {
				instance.error('Not a user!', i)
				return
			}

			reply += '\n' + (<Discord.User> user).avatarURL + ' '
		}

		return reply
	}
}

class About extends CommandBase {
	help = 'About'

	constructor(holder: CommandHolder) {
		super(holder, 'about')
	}

	executed(instance: CommandExecutionInstance) {
		return 'DeeeBootTheDeescordBot V2.0\nRewrite because this thing needs to work better.'
	}
}

const initMessage = [
	'Bleh', 'Pne?', 'Ponies are coming for you', 'Ponis everiwhere!', 'gnignip', 'k', 'Am I a bot?',
	'It is so fun!', 'Lookin\' for something interesting', '*jumps*', 'pew pew', 'vroom'
];

const finishMessage = [
	'this server', 'equestrian bunkers', 'dimension portal controller', 'factories', 'russian botnet',
	'pony PC botnet', 'your PC', 'your Router', 'NSA', 'Mars', 'laboratories', 'bad humans jail',
	'the Machine', 'skynet prototype', 'Russia', 'USA nuclear bombs timer', 'Discord status server',
	'burning fire', 'Google DNS', 'leafletjs.com maps', 'GitLab', 'not working GitHub', 'NotSoSuper',
	'DBot', 'a cat', 'Java application', 'british secret bases', 'China supercomputers', '\\n',
	'your code', 'cake', 'NotSoBot', 'command', 'trap music DJ', 'localhost', '127.0.0.1', '127.199.199.1',
	'meow', 'hacked Miecraft server', 'GMod updates', 'isitdownrightnow.com', 'Google AI', 'Samsung smartphone',
	'memeland', 'block cutting machine', 'HAYO PRODUCTIONS!', 'SCP-173'
];

class Ping extends CommandBase {
	help = 'Time to reply'

	constructor(holder: CommandHolder) {
		super(holder, 'ping')
	}

	executed(instance: CommandExecutionInstance) {
		const now = new Date()

		const promise = instance.send(initMessage.random())

		if (promise) {
			promise.then((msg) => {
				const newnow = new Date()
				msg = <Discord.Message> msg
				msg.edit(`It takes **${(newnow.getTime() - now.getTime())}** ms to ping **${instance.next() || finishMessage.random()}**`)
			})
		}
	}
}

export {Invite, SetAvatar, GetAvatar, About, Ping}