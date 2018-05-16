
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
	args = '<string>'
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

class ServerOwnerCommand extends CommandBase {
	help = 'Displays owner of the guild'
	canBeBanned = false
	allowPM = false

	constructor() {
		super('owner')
	}

	executed(instance: CommandExecutionInstance) {
		return 'Owner of the server is <@' + instance.server!.ownerID + '>'
	}
}

const permissionlist: Discord.PermissionResolvable[] = [
	'CREATE_INSTANT_INVITE',
	'KICK_MEMBERS',
	'BAN_MEMBERS',
	'MANAGE_CHANNELS',
	'MANAGE_GUILD',
	'ADD_REACTIONS',
	// 'VIEW_AUDIT_LOG',
	'VIEW_CHANNEL',
	'SEND_MESSAGES',
	'SEND_TTS_MESSAGES',
	'MANAGE_MESSAGES',
	'EMBED_LINKS',
	'ATTACH_FILES',
	'READ_MESSAGE_HISTORY',
	'MENTION_EVERYONE',
	'USE_EXTERNAL_EMOJIS',
	'CONNECT',
	'SPEAK',
	'MUTE_MEMBERS',
	'DEAFEN_MEMBERS',
	'MOVE_MEMBERS',
	'USE_VAD',
	'CHANGE_NICKNAME',
	'MANAGE_NICKNAMES',
	'MANAGE_ROLES',
	'MANAGE_WEBHOOKS',
	'MANAGE_EMOJIS',
]

class PermissionsList extends CommandBase {
	allowPM = false
	help = 'Displays permission of specified user'
	args = '[user = you]'
	allowMembers = true

	constructor() {
		super('permissions', 'perms', 'perm')
	}

	executed(instance: CommandExecutionInstance) {
		let user = instance.member

		if (instance.get(1) instanceof Discord.GuildMember) {
			user = instance.get(1)
		}

		if (!user) {
			return true
		}

		if (!user.hasPermission('ADMINISTRATOR')) {
			const lines: string[] = []

			for (const perm of permissionlist) {
				lines.push(perm + (' ').repeat(17 - (<string> perm).length) + ': ' + user.hasPermission(perm))
			}

			instance.reply('Permissions: ```\n' + lines.join('\n') + '```')
		} else {
			instance.reply('User is an Administrator\n(all permissions, bypass some checks (both Discord\'s channel permission overwrites and this bot\'s some checks))')
		}
	}
}

class AdminList extends CommandBase {
	allowPM = false
	help = 'Displays users with specified permission'
	args = '[permission = ADMINISTRATOR]'

	constructor() {
		super('admins', 'adminlist')
	}

	executed(instance: CommandExecutionInstance) {
		const perm = <Discord.PermissionResolvable> (<string> (instance.get(1) || 'ADMINISTRATOR')).toUpperCase()

		if (!permissionlist.includes(perm) && perm != 'ADMINISTRATOR') {
			instance.error('Invalid permission supplied', 1)
			return
		}

		const users: string[] = []

		for (const member of instance.server!.members.values()) {
			if (member.hasPermission(perm)) {
				users.push(member.nickname || member.user.username)
			}
		}

		if (users.length != 0 && users.length < 30) {
			instance.reply('Users with ' + perm + ' permission are: ```\n' + users.join(', ') + '```')
		} else if (users.length < 30) {
			instance.reply('No users are avaliable with ' + perm + ' permission!')
		} else {
			instance.reply('There are ' + users.length + ' users with ' + perm + ' permission')
		}
	}
}

class ServerInfo extends CommandBase {
	allowPM = false
	help = 'Displays server information'

	constructor() {
		super('server', 'serverinfo')
	}

	executed(instance: CommandExecutionInstance) {
		const verLevel = instance.server!.verificationLevel == 0 && 'NONE' ||
			instance.server!.verificationLevel == 1 && 'LOW' ||
			instance.server!.verificationLevel == 2 && 'MEDIUM' ||
			instance.server!.verificationLevel == 3 && 'HIGH'

		instance.reply(
			`\`\`\`
Server name:               ${instance.server!.name}
Server ID:                 ${instance.server!.id}
Server owner:              @${instance.server!.owner.nickname || instance.server!.owner.user.username} <@${instance.server!.owner.id}>
Server avatar: ${instance.server!.iconURL || '<no image>'}
Server users:              ${instance.server!.members.size} on fetch/${instance.server!.memberCount} total
Server channels:           ${instance.server!.channels.size}
Server roles:              ${instance.server!.roles.size}
Server region:             ${instance.server!.region}
Server created at:         ${instance.server!.createdAt }
Server verification:       ${verLevel}
\`\`\``
		)
	}
}

export {HashCommand, ServerOwnerCommand, PermissionsList, AdminList, ServerInfo}
