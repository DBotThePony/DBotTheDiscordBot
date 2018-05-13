
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
import { BotInstance } from '../../BotInstance';

class UserWithUserCommand extends CommandBase {
	fstring: string
	allowUsers = true
	actionID: number | null = null

	constructor(commName: string | string[], fstring: string, help?: string) {
		super(commName)
		this.fstring = fstring
		this.help = help || typeof commName == 'object' && commName[0] || (<string> commName)
	}

	setHolder(holder: CommandHolder) {
		this.holder = holder
		if (!this.bot) {
			throw new Error('Invalid bot initialization')
		}

		this.bot.storage.nextActionID = (this.bot.storage.nextActionID || 0) + 1
		this.actionID = this.bot.storage.nextActionID
		return this
	}

	executed(instance: CommandExecutionInstance) {
		let actor = <Discord.User> instance.user
		let targetUser = <Discord.User> instance.next()

		if (!targetUser) {
			targetUser = actor
			actor = (<BotInstance> this.bot).client.user
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
	actionID: number | null = null

	constructor(commName: string | string[], fstringAlone: string, fstringWith: string, help?: string) {
		super(commName)
		this.fstringAlone = fstringAlone
		this.fstringWith = fstringWith
		this.help = help || typeof commName == 'object' && commName[0] || (<string> commName)
	}

	setHolder(holder: CommandHolder) {
		this.holder = holder
		if (!this.bot) {
			throw new Error('Invalid bot initialization')
		}

		this.bot.storage.nextActionID = (this.bot.storage.nextActionID || 0) + 1
		this.actionID = this.bot.storage.nextActionID
		return this
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
	holder.registerCommand(new UserWithUserCommand('hug', '%s hugs %s', 'hugs? ^w^'))
	holder.registerCommand(new UserWithUserCommand('poke', '%s pokes %s', 'Pokes'))
	holder.registerCommand(new UserWithUserCommand('punch', '%s punches %s', 'PUNCH'))
	holder.registerCommand(new UserWithUserCommand('squeeze', '%s hugs tight %s', 'huggy'))
	holder.registerCommand(new UserWithUserCommand('cuddle', '%s cuddles %s', 'Cuddly'))
	holder.registerCommand(new UserWithUserCommand('snuggle', '%s snuggles %s', 'snuggly pillow'))
	holder.registerCommand(new UserWithUserCommand('rub', '%s rubs %s', 'rubby'))
	holder.registerCommand(new UserWithUserCommand('stroke', '%s slowly strokes %s', 'heartstrokes'))
	holder.registerCommand(new UserWithUserCommand('slap', '%s slaps %s', 'ouch'))
	holder.registerCommand(new UserWithUserCommand('boop', '%s boops nosey of %s', 'got your nosey'))
	holder.registerCommand(new UserWithUserCommand('lick', '%s nose licks %s', 'mmmm'))
	holder.registerCommand(new UserWithUserCommand('brush', '%s brushes mane of %s', 'oooooh'))
	holder.registerCommand(new UserWithUserCommand('earnom', '%s softly bites ears of %s', 'mmmmm!'))
	holder.registerCommand(new UserWithUserCommand('chokeslam', '%s CHOKESLAMS %s', 'ded'))
	holder.registerCommand(new UserWithUserCommand(['sniff', 'sniffs'], '%s sniffs %s', 'why would you do this'))
	holder.registerCommand(new UserWithUserCommand(['manenom', 'manebite'], '%s sniffs %s', 'why would you do this'))
	holder.registerCommand(new UserWithUserCommand(['nom', 'nosenom'], '%s nose noms %s', 'not what you think'))
	holder.registerCommand(new UserWithUserCommand(['fuck'], '%s fukks %s', 'r00d'))
	holder.registerCommand(new UserWithUserCommand('pet', '%s pets %s', 'oww'))
	holder.registerCommand(new UserWithUserCommand('fluff', '%s makes fluffesh %s', 'more fluff!'))
	holder.registerCommand(new UserWithUserCommand('box', '%s boxes %s', 'pone boxing'))
	holder.registerCommand(new UserWithUserCommand('hoofnom', '%s hoof nom of %s', 'hmmm?'))
	holder.registerCommand(new UserWithUserCommand('tailnom', '%s softly chews tail of %s', 'that tickles!'))
	holder.registerCommand(new UserWithUserCommand('lewd', '%s makes lewdish %s', '>w<'))
	holder.registerCommand(new UserWithUserCommand('bread', '%s gives bread to %s', 'baguette'))

	holder.registerCommand(new UserWithEnvCommand('sit', '%s sits', '%s sits on %s', 'sitty'))
	holder.registerCommand(new UserWithEnvCommand('jump', '%s jumps around', '%s jumps on %s', 'Jumps'))
	holder.registerCommand(new UserWithEnvCommand('sleep', '%s sleeps on grass', '%s sleep on %s', 'Sleeeeeepy'))
	holder.registerCommand(new UserWithEnvCommand('lay', '%s lays on pillows', '%s lay on %s', 'not sleepy'))
}

export {RegisterRPActions}
