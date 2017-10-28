
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

	constructor(holder: CommandHolder, commName: string | string[], fstring: string, help?: string) {
		super(holder, commName)
		this.fstring = fstring
		this.help = help || typeof commName == 'object' && commName[0] || (<string> commName)
		this.bot.storage.nextActionID = (this.bot.storage.nextActionID || 0) + 1
		this.actionID = this.bot.storage.nextActionID
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
			instance.query(`INSERT INTO "roleplay_generic" VALUES ('${actor.id}', '${this.actionID}', '1') ON CONFLICT
			("actor", "action") DO UPDATE SET "times" = "roleplay_generic"."times" + 1 RETURNING "times"`).then((data2) => {
				instance.say('_' + sprintf(this.fstring, `<@${actor.id}>`, `<@${targetUser.id}>`) + ` (${data && data.rows[0] && data.rows[0].times} times with <@${targetUser.id}>/${data2 && data2.rows[0] && data2.rows[0].times} times in total)_`)
			})
		})
	}
}

class UserWithEnvCommand extends CommandBase {
	fstringAlone: string
	fstringWith: string
	allowUsers = true
	actionID: number

	constructor(holder: CommandHolder, commName: string | string[], fstringAlone: string, fstringWith: string, help?: string) {
		super(holder, commName)
		this.fstringAlone = fstringAlone
		this.fstringWith = fstringWith
		this.help = help || typeof commName == 'object' && commName[0] || (<string> commName)
		this.bot.storage.nextActionID = (this.bot.storage.nextActionID || 0) + 1
		this.actionID = this.bot.storage.nextActionID
	}

	executed(instance: CommandExecutionInstance) {
		let actor = <Discord.User> instance.user
		let alone = false
		let targetUser = <Discord.User> instance.next()

		if (!targetUser) {
			alone = true
		}

		if (!alone && typeof targetUser != 'object') {
			instance.error('Not a user!', 1)
			return
		}

		if (!alone) {
			instance.query(`INSERT INTO "roleplay" VALUES ('${actor.id}', '${targetUser.id}', '${this.actionID}', '1') ON CONFLICT
			("actor", "target", "action") DO UPDATE SET "times" = "roleplay"."times" + 1 RETURNING "times"`).then((data) => {
				instance.say('_' + sprintf(this.fstringWith, `<@${actor.id}>`, `<@${targetUser.id}>`) + ` (${data && data.rows[0] && data.rows[0].times} times with <@${targetUser.id}>)_`)
			})
		} else {
			instance.query(`INSERT INTO "roleplay_generic" VALUES ('${actor.id}', '${this.actionID}', '1') ON CONFLICT
			("actor", "action") DO UPDATE SET "times" = "roleplay_generic"."times" + 1 RETURNING "times"`).then((data) => {
				instance.say('_' + sprintf(this.fstringAlone, `<@${actor.id}>`) + ` (${data && data.rows[0] && data.rows[0].times} times alone)_`)
			})
		}
	}
}

const RegisterRPActions = function(holder: CommandHolder) {
	holder.registerCommand(new UserWithUserCommand(holder, 'hug', '%s hugs %s', 'hugs? ^w^'))
	holder.registerCommand(new UserWithUserCommand(holder, 'poke', '%s pokes %s', 'Pokes'))
	holder.registerCommand(new UserWithUserCommand(holder, 'punch', '%s punches %s', 'PUNCH'))
	holder.registerCommand(new UserWithUserCommand(holder, 'squeeze', '%s hugs tight %s', 'huggy'))
	holder.registerCommand(new UserWithUserCommand(holder, 'cuddle', '%s cuddles %s', 'Cuddly'))
	holder.registerCommand(new UserWithUserCommand(holder, 'snuggle', '%s snuggles %s', 'snuggly pillow'))
	holder.registerCommand(new UserWithUserCommand(holder, 'rub', '%s rubs %s', 'rubby'))
	holder.registerCommand(new UserWithUserCommand(holder, 'stroke', '%s slowly strokes %s', 'heartstrokes'))
	holder.registerCommand(new UserWithUserCommand(holder, 'slap', '%s slaps %s', 'ouch'))
	holder.registerCommand(new UserWithUserCommand(holder, 'boop', '%s boops nosey of %s', 'got your nosey'))
	holder.registerCommand(new UserWithUserCommand(holder, 'lick', '%s nose licks %s', 'mmmm'))
	holder.registerCommand(new UserWithUserCommand(holder, 'brush', '%s brushes mane of %s', 'oooooh'))
	holder.registerCommand(new UserWithUserCommand(holder, 'earnom', '%s softly bites ears of %s', 'mmmmm!'))
	holder.registerCommand(new UserWithUserCommand(holder, 'chokeslam', '%s CHOKESLAMS %s', 'ded'))
	holder.registerCommand(new UserWithUserCommand(holder, ['sniff', 'sniffs'], '%s sniffs %s', 'why would you do this'))
	holder.registerCommand(new UserWithUserCommand(holder, ['manenom', 'manebite'], '%s sniffs %s', 'why would you do this'))
	holder.registerCommand(new UserWithUserCommand(holder, ['nom', 'nosenom'], '%s nose noms %s', 'not what you think'))
	holder.registerCommand(new UserWithUserCommand(holder, ['fuck'], '%s fukks %s', 'r00d'))
	holder.registerCommand(new UserWithUserCommand(holder, 'pet', '%s pets %s', 'oww'))
	holder.registerCommand(new UserWithUserCommand(holder, 'fluff', '%s makes fluffesh %s', 'more fluff!'))
	holder.registerCommand(new UserWithUserCommand(holder, 'box', '%s boxes %s', 'pone boxing'))
	holder.registerCommand(new UserWithUserCommand(holder, 'hoofnom', '%s hoof nom of %s', 'hmmm?'))
	holder.registerCommand(new UserWithUserCommand(holder, 'tailnom', '%s softly chews tail of %s', 'that tickles!'))
	holder.registerCommand(new UserWithUserCommand(holder, 'lewd', '%s makes lewdish %s', '>w<'))
	holder.registerCommand(new UserWithUserCommand(holder, 'bread', '%s gives bread to %s', 'baguette'))

	holder.registerCommand(new UserWithEnvCommand(holder, 'sit', '%s sits', '%s sits on %s', 'sitty'))
	holder.registerCommand(new UserWithEnvCommand(holder, 'jump', '%s jumps around', '%s jumps on %s', 'Jumps'))
	holder.registerCommand(new UserWithEnvCommand(holder, 'sleep', '%s sleeps on grass', '%s sleep on %s', 'Sleeeeeepy'))
	holder.registerCommand(new UserWithEnvCommand(holder, 'lay', '%s lays on pillows', '%s lay on %s', 'not sleepy'))
}

export {RegisterRPActions}
