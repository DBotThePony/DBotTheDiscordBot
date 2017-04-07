

// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
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

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const excludeRoles = [
	'READ_MESSAGES',
	'SEND_MESSAGES',
	'EMBED_LINKS',
	'ATTACH_FILES',
	'READ_MESSAGE_HISTORY',
	'USE_VAD',
	'CHANGE_NICKNAME',
	'CREATE_INSTANT_INVITE',
	'MENTION_EVERYONE',
	'CONNECT',
	'SPEAK',
	'ADD_REACTIONS',
	'SEND_TTS_MESSAGES'
];

module.exports = {
	name: 'role',
	
	help_args: '<role name>',
	desc: 'Prints info about role',
	nopm: true,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'role', args, 1);
		
		const role = DBot.findRole(msg.channel.guild, args[0]);
		
		if (!role)
			return DBot.CommandError('No such role', 'role', args, 1);
		
		let perms = [];
		let s = role.serialize();
		
		for (let i in s) {
			if (s[i] && !excludeRoles.includes(i)) {
				perms.push(i);
			}
		}
		
		let output = '```';
		
		output += 'Role name:                     ' + role.name + '\n';
		output += 'Role ID:                       ' + role.id + '\n';
		output += 'Is mentionable:                ' + role.mentionable + '\n';
		output += 'Is hoist:                      ' + role.hoist + '\n';
		output += 'Role color:                    ' + Util.parseHexColor(role.hexColor).join(', ') + '\n';
		
		if (perms) {
			output += 'Role permissions:              ' + perms.join(', ') + '\n';
		}
		
		output += '```';
		return output;
	}
};

DBot.RegisterCommand({
	name: 'roles',
	
	help_args: '[user]',
	desc: 'Get list of user roles',
	nopm: true,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		const target = this.server.member(typeof args[0] === 'object' || msg.author);
		if (!target)
			return DBot.CommandError('Invalid user', 'roles', args, 1);
		
		const output = [];
		
		for (const role of target.roles.values())
			output.push(role.name);
		
		return '```' + output.join(', ') + '```';
	}
});

DBot.RegisterCommand({
	name: 'addrole',
	
	help_args: '<role name>',
	desc: 'Adds specified role to everyone who have not any roles. Excludes bot and you.',
	nopm: true,
	
	func: function(args, cmd, msg) {
		const me = msg.channel.guild.member(DBot.bot.user);
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') && !DBot.owners.includes(msg.author.id))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'addrole', args, 1);
		
		const role = DBot.findRole(msg.channel.guild, args[0]);
		
		if (!role)
			return DBot.CommandError('No such role', 'addrole', args, 1);
		
		let HIT = false;
		let total = 0;
		
		for (const member of msg.channel.guild.members.array()) {
			if (member.roles.array().length !== 1 || member.id === me.id || member.id === msg.member.id) continue;
			
			total++;
			msg.channel.startTyping();

			member.addRole(role)
			.then(function() {
				msg.channel.stopTyping();
			})
			.catch(function() {
				msg.channel.stopTyping();
				if (HIT)
					return;

				HIT = true;
				msg.reply('Unable to set role for <@' + (member.id) + '>. All further errors would not be shown.');
			});
		}
		
		return 'Doing role setup!\nTotal to add: ' + total;
	}
});

DBot.RegisterCommand({
	name: 'maddrole',
	alias: ['massaddrole', 'addrolemass'],
	
	help_args: '<role name> <users/selections>',
	desc: 'Adds specified role to specified users.',
	nopm: true,
	selections: true,
	
	func: function(args, cmd, msg) {
		const me = msg.channel.guild.member(DBot.bot.user);
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') && !DBot.owners.includes(msg.author.id))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'maddrole', args, 1);
		
		const role = DBot.findRole(msg.channel.guild, args[0]);
		
		if (!role)
			return DBot.CommandError('No such role', 'maddrole', args, 1);
		
		if (!args[1])
			return DBot.CommandError('At least one argument is required', 'maddrole', args, 1);
		
		let HIT = false;
		const valids = [];
		let done = 0;
		
		for (let i = 1; i < args.length; i++) {
			const user = args[i];
			if (typeof user !== 'object')
				return DBot.CommandError('Invalid user argument', 'maddrole', args, Number(i) + 1);
			
			const member = msg.channel.guild.member(user);
			
			if (member === null)
				return DBot.CommandError('Invalid user argument', 'maddrole', args, Number(i) + 1);
			
			if (member.id === DBot.bot.user.id || member.id === msg.author.id)
				return DBot.CommandError('Oh?', 'maddrole', args, Number(i) + 1);
			
			if (!DBot.CanTarget(me, member))
				return DBot.CommandError('Can\'t target that ;n;', 'maddrole', args, Number(i) + 1);

			if (!DBot.CanTarget(msg.member, member))
				return DBot.CommandError('You are unable to target that user', 'maddrole', args, Number(i) + 1);
			
			if (!member.roles.has(role.id))
				valids.push(member);
		}
		
		if (valids.length === 0)
			return 'No valid users!';
		
		msg.channel.startTyping();
		
		for (const member of valids) {
			member.addRole(role)
			.then(() => {
				done++;
				if (done === valids.length) {
					msg.reply('Done');
					msg.channel.stopTyping();
				}
			})
			.catch(() => {
				done++;
				if (HIT) return;
				HIT = true;
				msg.reply('Unable to set role for <@' + (member.id) + '>. All further errors would not be shown.');
			});
		}
		
		return 'Doing role setup!\nTotal to add: ' + valids.length;
	}
});

DBot.RegisterCommand({
	name: 'addrole_all',
	
	help_args: '<role name>',
	desc: 'Adds specified role to everyone. Excludes bot and you.',
	nopm: true,
	
	func: function(args, cmd, msg) {
		const me = msg.channel.guild.member(DBot.bot.user);
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') && !DBot.owners.includes(msg.author.id))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'addrole_all', args, 1);
		
		const role = DBot.findRole(msg.channel.guild, args[0]);
		
		if (!role)
			return DBot.CommandError('No such role', 'addrole_all', args, 1);
		
		let HIT = false;
		let total = 0;
		
		for (const member of msg.channel.guild.members.array()) {
			if (member.roles.array().includes(role) || member.id === me.id || member.id === msg.member.id) continue;
			total++;
			msg.channel.startTyping();

			member.addRole(role)
			.then(function() {
				msg.channel.stopTyping();
			})
			.catch(function() {
				msg.channel.stopTyping();
				if (HIT)
					return;

				HIT = true;
				msg.reply('Unable to set role for <@' + (member.id) + '>. All further errors would not be shown.');
			});
		}
		
		return 'Doing role setup!\nTotal to add: ' + total;
	}
});

DBot.RegisterCommand({
	name: 'rmrole',
	alias: ['delrole'],
	
	help_args: '<role name>',
	desc: 'Removes specified role from everyone who have this role. Excludes bot and you.',
	nopm: true,
	
	func: function(args, cmd, msg) {
		const me = msg.channel.guild.member(DBot.bot.user);
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') && !DBot.owners.includes(msg.author.id))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'rmrole', args, 1);
		
		const role = DBot.findRole(msg.channel.guild, args[0]);
		
		if (!role)
			return DBot.CommandError('No such role', 'rmrole', args, 1);
		
		let HIT = false;
		
		let total = 0;
		
		for (const member of msg.channel.guild.members.array()) {
			if (!member.roles.array().includes(role) || member.id === me.id || member.id === msg.member.id) continue;
			msg.channel.startTyping();

			total++;
			member.removeRole(role)
			.then(function() {
				msg.channel.stopTyping();
			})
			.catch(function() {
				msg.channel.stopTyping();
				if (HIT)
					return;

				HIT = true;
				msg.reply('Unable to remove role from <@' + (member.id) + '>. All further errors would not be shown.');
			});
		}
		
		return 'Doing role remove!\nTotal to remove: ' + total;
	}
});

DBot.RegisterCommand({
	name: 'mrmrole',
	alias: ['massrmrole', 'rmrolemass'],
	
	help_args: '<role name> <users/selections>',
	desc: 'Removes specified role to specified users.',
	nopm: true,
	selections: true,
	
	func: function(args, cmd, msg) {
		const me = msg.channel.guild.member(DBot.bot.user);
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') && !DBot.owners.includes(msg.author.id))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'maddrole', args, 1);
		
		const role = DBot.findRole(msg.channel.guild, args[0]);
		
		if (!role)
			return DBot.CommandError('No such role', 'maddrole', args, 1);
		
		if (!args[1])
			return DBot.CommandError('At least one argument is required', 'maddrole', args, 1);
		
		let HIT = false;
		const valids = [];
		let done = 0;
		
		for (let i = 1; i < args.length; i++) {
			const user = args[i];
			if (typeof user !== 'object')
				return DBot.CommandError('Invalid user argument', 'maddrole', args, Number(i) + 1);
			
			const member = msg.channel.guild.member(user);
			
			if (member === null)
				return DBot.CommandError('Invalid user argument', 'maddrole', args, Number(i) + 1);
			
			if (member.id === DBot.bot.user.id || member.id === msg.author.id)
				return DBot.CommandError('Oh?', 'maddrole', args, Number(i) + 1);
			
			if (!DBot.CanTarget(me, member))
				return DBot.CommandError('Can\'t target that ;n;', 'maddrole', args, Number(i) + 1);

			if (!DBot.CanTarget(msg.member, member))
				return DBot.CommandError('You are unable to target that user', 'maddrole', args, Number(i) + 1);
			
			if (member.roles.has(role.id))
				valids.push(member);
		}
		
		if (valids.length === 0)
			return 'No valid users!';
		
		msg.channel.startTyping();
		
		for (const member of valids) {
			member.removeRole(role)
			.then(() => {
				done++;
				if (done === valids.length) {
					msg.reply('Done');
					msg.channel.stopTyping();
				}
			})
			.catch(() => {
				done++;
				if (HIT) return;
				HIT = true;
				msg.reply('Unable to remove role from <@' + (member.id) + '>. All further errors would not be shown.');
			});
		}
		
		return 'Doing role remove!\nTotal to remove: ' + valids.length;
	}
});
