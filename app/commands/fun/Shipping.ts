
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
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')

class ShippingCommand extends ImageCommandBase {
	help = 'ship'
	allowUsers = true

	constructor() {
		super('ship')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.get(1) || !(instance.get(1) instanceof Discord.User)) {
			instance.error('Two users are required', 1)
			return
		}

		if (!instance.get(2) || !(instance.get(2) instanceof Discord.User)) {
			instance.error('Two users are required', 2)
			return
		}

		if (instance.get(1) == instance.get(2)) {
			instance.error('forever alone', 2)
			return
		}

		let nickname1: string, nickname2: string
		const user1 = <Discord.User> instance.get(1)
		const user2 = <Discord.User> instance.get(2)

		if (instance.server) {
			nickname1 = instance.server.member(user1) && instance.server.member(user1).nickname || user1.username
			nickname2 = instance.server.member(user2) && instance.server.member(user2).nickname || user2.username
		} else {
			nickname1 = user1.username
			nickname2 = user2.username
		}

		const nick1Sub = Math.max(Math.floor(nickname1.length / 2), 4);
		const nick2Sub = Math.min(Math.floor(nickname2.length / 2), nick1Sub);
		const nick1Piece = nickname1.substr(0, nick1Sub);
		const nick2Piece = nickname2.substr(nick2Sub);

		const postShip = (imageBuffer?: Buffer | null) => {
			instance.query(`INSERT INTO "shipping" ("first", "second") VALUES (${user1.id}, ${user2.id}) ON CONFLICT ("first", "second") DO UPDATE SET "times" = "shipping"."times" + 1 RETURNING "times"`)
			.then((value) => {
				const shipText = `${instance.author} ships it (${value.rows[0].times} times now)\nShip name: **${nick1Piece}${nick2Piece}**`

				if (imageBuffer) {
					instance.reply(shipText, new Discord.Attachment(imageBuffer, 'ship.png'))
				} else {
					instance.reply(shipText)
				}
			})
		}

		if (user1.avatarURL && user2.avatarURL) {
			instance.loadImage(user1.avatarURL)
			.then((avatar1) => {
				instance.loadImage(user2.avatarURL)
				.then((avatar2) => {
					this.tryConvert2(instance,
						'(', avatar1, '-resize', '256x256!', ')',
						'(', './resource/emoji/2665.png', '-resize', '256x256!', ')',
						'(', avatar2, '-resize', '256x256!', ')',
						'+append', 'png:-')
					.then(imageBuffer => {
						postShip(imageBuffer)
					})
				})
			})

			return
		}

		postShip()
	}
}

export {ShippingCommand}
