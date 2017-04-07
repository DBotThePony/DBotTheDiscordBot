

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

module.exports = {
	name: 'cban',
	alias: ['bancommand', 'bancomm', 'commban', 'commandban'],
	
	help_args: '<realm: server/channel> <command(s)>',
	desc: 'Bans a command from using on this channel/server\nServer owner only\nSome of commands can not be banned or unbanned',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! This is PM channel! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
			return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
		
		let realm = args[0];
		let command = args[1];
		
		if (!realm || realm !== 'server' && realm !== 'channel' && realm !== 'member')
			return DBot.CommandError('Realm must be channel, server or member', 'cban', args, 1);
		
		if (realm === 'member') {
			command = args[2];
			
			if (!command || !DBot.Commands[command])
				return DBot.CommandError('No such command', 'cban', args, 3);
		} else {
			if (!command || !DBot.Commands[command])
				return DBot.CommandError('No such command', 'cban', args, 2);
		}
		
		let cBans;
		let getUser;
		
		if (realm === 'server') {
			cBans = DBot.ServerCBans(msg.channel.guild);
		} else if (realm === 'member') {
			if (typeof args[1] !== 'object')
				return DBot.CommandError('Must be an @User', 'cban', args, 2);
			
			getUser = msg.channel.guild.member(args[1]);
			
			if (!getUser)
				return DBot.CommandError('Must be an @User', 'cban', args, 2);
			
			cBans = DBot.MemberCBans(getUser);
		} else {
			cBans = DBot.ChannelCBans(msg.channel);
		}
		
		let success = [];
		let fail = [];
		let startI = 1;
		
		if (realm === 'member')
			startI = 2;
		
		for (i = startI; i < args.length; i++) {
			let id = args[i].toLowerCase();
			let data = DBot.Commands[id];
			
			if (!data) {
				fail.push(id);
				continue;
			}
			
			if (data.id !== id && data.name !== id) {
				id = data.id;
			}
			
			if (!DBot.DisallowCommandManipulate.includes(id)) {
				let status = cBans.ban(id);
				
				if (status)
					success.push(id);
				else
					fail.push(id);
			} else
				fail.push(id);
		}
		
		if (realm === 'server')
			return '\nBanned commands on server: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
		else if (realm === 'member')
			return '\nBanned commands from user @' + (getUser.nickname || getUser.user.username) + ': ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
		else
			return '\nBanned commands on channel: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
	}
};

DBot.RegisterCommand({
	name: 'cuban',
	alias: ['unbancommand', 'unbancomm', 'communban', 'commandunban'],
	
	help_args: '<realm: server/channel/member> <command(s)>',
	desc: 'Unbans a command from using on this channel/server/member\nServer owner only\nSome of commands can not be banned or unbanned',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! This is PM channel! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
			return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
		
		let realm = args[0];
		let command = args[1];
		
		if (!realm || realm !== 'server' && realm !== 'channel' && realm !== 'member')
			return DBot.CommandError('Realm must be channel, server or member', 'cban', args, 1);
		
		if (realm === 'member') {
			command = args[2];
			
			if (!command || !DBot.Commands[command])
				return DBot.CommandError('No such command', 'cban', args, 3);
		} else {
			if (!command || !DBot.Commands[command])
				return DBot.CommandError('No such command', 'cban', args, 2);
		}
		
		let cBans;
		let getUser;
		
		if (realm === 'server') {
			cBans = DBot.ServerCBans(msg.channel.guild);
		} else if (realm === 'member') {
			if (typeof args[1] !== 'object')
				return DBot.CommandError('Must be an @User', 'cban', args, 2);
			
			getUser = msg.channel.guild.member(args[1]);
			
			if (!getUser)
				return DBot.CommandError('Must be an @User', 'cban', args, 2);
			
			cBans = DBot.MemberCBans(getUser);
		} else {
			cBans = DBot.ChannelCBans(msg.channel);
		}
		
		let success = [];
		let fail = [];
		let startI = 1;
		
		if (realm === 'member')
			startI = 2;
		
		for (i = startI; i < args.length; i++) {
			let id = args[i].toLowerCase();
			let data = DBot.Commands[id];
			
			if (!data) {
				fail.push(id);
				continue;
			}
			
			if (data.id !== id && data.name !== id) {
				id = data.id;
			}
			
			if (!DBot.DisallowCommandManipulate.includes(id)) {
				let status = cBans.unBan(id);
				
				if (status)
					success.push(id);
				else
					fail.push(id);
			} else
				fail.push(id);
		}
		
		if (realm === 'server')
			return '\nUnbanned commands on server: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already not banned, or not allowed to be unbanned!';
		else if (realm === 'member')
			return '\nUnbanned commands from user @' + (getUser.nickname || getUser.user.username) + ': ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already not banned, or not allowed to be unbanned!';
		else
			return '\nUnbanned commands on channel: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already not banned, or not allowed to be unbanned!';
	}
});

DBot.RegisterCommand({
	name: 'clist',
	alias: ['bannedcommands', 'bannedcomm', 'commbanlist', 'commbans'],
	
	help_args: '[@user]',
	desc: 'Prints banned commands on channel and server',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg)) {
			return 'Onoh! This is PM channel!';
		}
		
		if (typeof args[0] !== 'object') {
			let cBans1 = DBot.ServerCBans(msg.channel.guild);
			let cBans2 = DBot.ChannelCBans(msg.channel);
			
			let output = '\nCommands banned on this server:\n';
			
			if (cBans1.bans[0]) {
				output += '```' + cBans1.bans.join(', ') + '```\n';
			} else {
				output += '<No bans>\n';
			}
			
			output += 'Commands banned on this channel:\n';
			
			if (cBans2.bans[0]) {
				output += '```' + cBans2.bans.join(', ') + '```\n';
			} else {
				output += '<No bans>\n';
			}
			
			return output;
		} else {
			let getUser = msg.channel.guild.member(args[0]);
			
			if (!getUser)
				return DBot.CommandError('Must be an @User', 'clist', args, 1);
			
			let cBans = DBot.MemberCBans(getUser);
			
			let output = '\nCommands banned from this user:\n';
			
			if (cBans.bans[0]) {
				output += '```' + cBans.bans.join(', ') + '```\n';
			} else {
				output += '<No bans>\n';
			}
			
			return output;
		}
	}
});

DBot.RegisterCommand({
	name: 'mute',
	alias: ['commandmute', 'mutecommands'],
	
	help_args: '<member>',
	desc: 'Disallow usage of ANY commands of specified user on **current server**',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! This is PM channel! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
			if (msg.member.checkBotMute(msg.channel))
				return;
			else
				return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
		
		if (typeof args[0] !== 'object')
			return DBot.CommandError('Must be an @User', 'mute', args, 1);
		
		if (args[0].id === DBot.bot.user.id)
			return DBot.CommandError('wat', 'mute', args, 1);
		
		let getUser = msg.channel.guild.member(args[0]);
		
		if (!getUser)
			return DBot.CommandError('Must be an @User', 'mute', args, 1);
		
		if (getUser.totalMute)
			return DBot.CommandError('<@' + getUser.user.id + '> is already muted. Loal 6.9', 'mute', args, 1);
		
		getUser.muteBot();
		
		return '<@' + getUser.user.id + '> successfully muted';
	}
});

DBot.RegisterCommand({
	name: 'cmute',
	alias: ['commandmutechannel', 'mutecommandschannel', 'channelmutecommands', 'channelcommandmute'],
	
	help_args: '<member>',
	desc: 'Disallow usage of ANY commands of specified user in **current channel**',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! This is PM channel! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
			if (msg.member.checkBotMute(msg.channel))
				return;
			else
				return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
		
		if (typeof args[0] !== 'object')
			return DBot.CommandError('Must be an @User', 'cmute', args, 1);
		
		if (args[0].id === DBot.bot.user.id)
			return DBot.CommandError('wat', 'cmute', args, 1);
		
		let getUser = msg.channel.guild.member(args[0]);
		
		if (!getUser)
			return DBot.CommandError('Must be an @User', 'cmute', args, 1);
		
		if (getUser.muteChannel(msg.channel))
			return '<@' + getUser.user.id + '> successfully muted in <#' + msg.channel.id + '>';
		else
			return DBot.CommandError('<@' + getUser.user.id + '> is already muted from <#' + msg.channel.id + '>. Loal 6.9', 'cmute', args, 1);
	}
});

DBot.RegisterCommand({
	name: 'unmute',
	alias: ['commandunmute', 'unmutecommands'],
	
	help_args: '<member>',
	desc: 'Unmute user, so he can use commands again',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! This is PM channel! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
			if (msg.member.checkBotMute(msg.channel))
				return;
			else
				return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
		
		if (typeof args[0] !== 'object')
			return DBot.CommandError('Must be an @User', 'unmute', args, 1);
		
		if (args[0].id === DBot.bot.user.id)
			return DBot.CommandError('wat', 'unmute', args, 1);
		
		let getUser = msg.channel.guild.member(args[0]);
		
		if (!getUser)
			return DBot.CommandError('Must be an @User', 'unmute', args, 1);
		
		if (!getUser.totalMute)
			return DBot.CommandError('<@' + getUser.user.id + '> is already not muted. Loal 6.9', 'unmute', args, 1);
		
		getUser.unMuteBot();
		
		return '<@' + getUser.user.id + '> successfully unmuted';
	}
});

DBot.RegisterCommand({
	name: 'cunmute',
	alias: ['commandunmutechannel', 'unmutecommandschannel', 'channelunmutecommands', 'channelcommandunmute'],
	
	help_args: '<member>',
	desc: 'Allow usage of commands of specified user in **current channel** if he was before muted by **channel**',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! This is PM channel! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
			if (msg.member.checkBotMute(msg.channel))
				return;
			else
				return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
		
		if (typeof args[0] !== 'object')
			return DBot.CommandError('Must be an @User', 'cumute', args, 1);
		
		if (args[0].id === DBot.bot.user.id)
			return DBot.CommandError('wat', 'cumute', args, 1);
		
		let getUser = msg.channel.guild.member(args[0]);
		
		if (!getUser)
			return DBot.CommandError('Must be an @User', 'cumute', args, 1);
		
		if (getUser.unMuteChannel(msg.channel))
			return '<@' + getUser.user.id + '> successfully unmuted from <#' + msg.channel.id + '>';
		else
			return DBot.CommandError('<@' + getUser.user.id + '> is already not muted from <#' + msg.channel.id + '>. Loal 6.9', 'cumute', args, 1);
	}
});

DBot.RegisterCommand({
	name: 'cmds',
	alias: ['cmd'],
	
	help_args: '<action: add/list/remove> <realm: server/channel/member> <command(s) to ban/unban>',
	desc: 'Manipulating commands bans. If you specify realm as @Mentioned member, it will manipulate commands for him.',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM, Oh?';
		
		let action = args[0];
		let realm = args[1];
		
		let cmdsList = [];
		
		for (let i = 2; i < args.length; i++) {
			cmdsList.push(args[i]);
		}
		
		let cmdsObj;
		
		if (!action)
			return DBot.CommandError('Invalid action. Valid are: add, list and remove', 'cmds', args, 1);
		
		action = action.toLowerCase();
		
		if (action !== 'add' && action !== 'list' && action !== 'remove' && action !== 'delete' && action !== 'rm')
			return DBot.CommandError('Invalid action. Valid are: add, list and remove', 'cmds', args, 1);
		
		if (typeof realm === 'object') {
			let getUser = msg.channel.guild.member(args[1]);
			if (!getUser) return DBot.CommandError('what', 'cmds', args, 2);
			cmdsObj = DBot.MemberCBans(getUser);
		} else {
			if (!realm)
				return DBot.CommandError('Invalid realm. Valid are: member, server or channel', 'cmds', args, 2);

			realm = realm.toLowerCase();

			if (realm !== 'server' && realm !== 'channel')
				return DBot.CommandError('Invalid realm. Valid are: member, server or channel', 'cmds', args, 2);
		}
		
		if (realm === 'channel')
			cmdsObj = DBot.ChannelCBans(msg.channel);
		else if (realm === 'server')
			cmdsObj = DBot.ServerCBans(msg.channel.guild);

		let word = 'Ban';
		if (action !== 'add')
			word = 'Unban';
		
		if (action !== 'list') {
			if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
				return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
			
			if (cmdsList.length === 0)
				return DBot.CommandError('You need at least one command to ban/unban', 'unbantag', args, 3);

			let success = [];

			for (const cmd of cmdsList) {
				let id = cmd.toLowerCase();
				let data = DBot.Commands[id];

				if (!data) continue;
				id = data.id;

				if (!DBot.DisallowCommandManipulate.includes(id)) {
					let status;
					if (action !== 'add')
						status = cmdsObj.unBan(id);
					else
						status = cmdsObj.ban(id);
					
					if (status) success.push(id);
				}
			}
			
			let word = 'Ban';
			
			if (action !== 'add')
				word = 'Unban';

			if (typeof realm === 'object')
				return word + ' results\n' + word + 'ned commands from @' + realm.username + ': ' + success.join(', ');
			else if (realm === 'channel')
				return word + ' results\n' + word + 'ned commands from this channel: ' + success.join(', ');
			else
				return word + ' results\n' + word + 'ned commands from this server: ' + success.join(', ');
		} else {
			if (typeof realm === 'object')
				return word + 'ned commands from @' + realm.username + ': ' + cmdsObj.generateList();
			else if (realm === 'channel')
				return word + 'ned commands from this channel: ' + cmdsObj.generateList();
			else if (realm === 'server')
				return word + 'ned commands from this server: ' + cmdsObj.generateList();
		}
	}
});

DBot.RegisterCommand({
	name: 'cmds_privs',
	alias: ['cmd_privs', 'cmd_roles', 'cmds_roles', 'cmd-privs', 'cmd-roles', 'cmds-roles', 'cmds-privs'],
	
	help_args: '<action: add/list/remove/iswhite> <type: role/perms> <command> <arguments>',
	desc: 'Manipulating with commands permissions',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM, Oh?';
		
		let action = args[0];
		let bans = DBot.ServerCBans(msg.channel.guild);
		let realm = args[1];
		
		if (!action)
			return DBot.CommandError('Invalid action. Valid are: add, list and remove', 'cmds_privs', args, 1);
		
		action = action.toLowerCase();
		
		if (action !== 'add' && action !== 'list' && action !== 'remove' && action !== 'delete' && action !== 'rm' && action !== 'iswhite')
			return DBot.CommandError('Invalid action. Valid are: add, list and remove', 'cmds_privs', args, 1);
		
		if (!realm)
			return DBot.CommandError('Invalid type. Valid are: role or perms', 'cmds_privs', args, 2);

		realm = realm.toLowerCase();

		if (realm !== 'role' && realm !== 'perms')
			return DBot.CommandError('Invalid type. Valid are: role or perms', 'cmds_privs', args, 2);
		
		if (action === 'list') {
			if (realm === 'role') {
				let output = '```\nCommand                  Roles              Is Whitelist\n';
				let evenHit = false;
				
				for (const command in bans.roleBans) {
					const data = bans.roleBans[command];
					
					if (data.bans.length === 0)
						continue;
					
					let comp;
					
					for (const roleUID of data.bans) {
						let getRole;
						
						for (const sRole of msg.channel.guild.roles.values()) {
							if (Number(sRole.uid) === roleUID) {
								getRole = sRole;
								break;
							}
						}
						
						if (!getRole) continue;
						if (comp)
							comp += ', ' + getRole.name;
						else
							comp = getRole.name;
					}
					
					if (comp) {
						evenHit = true;
						output += `${command}    ${comp}    ${data.isWhite}\n`;
					}
				}
				
				if (!evenHit) {
					return 'No data to list! ;-;';
				} else {
					return output + '```';
				}
			} else if (realm === 'perms') {
				let output = '```\nCommand                  Permissions\n';
				let evenHit = false;
				
				for (const command in bans.roleBans) {
					const data = bans.permsBans[command];
					
					if (data.length === 0)
						continue;
					
					evenHit = true;
					output += `${command}    ${data.join(', ')}\n`;
				}
				
				if (!evenHit) {
					return 'No data to list! ;-;';
				} else {
					return output + '```';
				}
			}
		} else {
			if (!msg.member.hasPermission('MANAGE_GUILD') && !DBot.owners.includes(msg.author.id))
				return 'Onoh! You must have at least `MANAGE_GUILD` permission to do that! ;-;';
			
			if (!args[2])
				return DBot.CommandError('Command is missing', 'cmds_privs', args, 3);
			
			const commandIDRaw = args[2].toLowerCase();
			const data = DBot.Commands[commandIDRaw];

			if (!data)
				return DBot.CommandError('Command does not exist', 'cmds_privs', args, 3);
			

			if (DBot.DisallowCommandManipulate.includes(data.id))
				return DBot.CommandError('Command is not allowed to be manipulated', 'cmds_privs', args, 3);
			
			const command = data.id;
			
			if (!args[3])
				return DBot.CommandError('At least one argument is required', 'cmds_privs', args, 4);
			
			const newAction = action === 'add';
			
			if (realm === 'role') {
				if (action === 'iswhite') {
					let transfer;
					const val = args[3].toLowerCase();
					
					if (val === '1' || val === 'true' || val === 't')
						transfer = true;
					else if (val === '0' || val === 'false' || val === 'f')
						transfer = false;
					else
						return DBot.CommandError('Invalid boolean passed', 'cmds_privs', args, 4);
					
					bans.setIsWhite(command, transfer);
					return 'Applied changes';
				}
				
				const realRoles = [];

				// First - find
				for (let i = 3; i < args.length; i++) {
					const arg = args[i];
					const find = DBot.findRole(msg.channel.guild, arg, true);

					if (!find)
						return DBot.CommandError('Unable to find specified role', 'cmds_privs', args, i + 1);
					else if (Array.isArray(find))
						return DBot.CommandError('Role reference is ambiguous. Use explicit role name, e.g. "role name"', 'cmds_privs', args, i + 1);
					else
						realRoles.push(find);
				}

				// Second - apply changes
				for (const role of realRoles) {
					if (newAction)
						bans.addRole(command, role);
					else
						bans.removeRole(command, role);
				}

				return 'Applied changes';
			} else if (realm === 'perms') {
				if (action === 'iswhite')
					return DBot.CommandError('Action now allowed', 'cmds_privs', args, 1);
				
				// First - check
				for (let i = 3; i < args.length; i++) {
					const arg = args[i].toUpperCase();

					if (!DBot.validPerms.includes(arg))
						return DBot.CommandError('Invalid permission', 'cmds_privs', args, i + 1);
				}

				// Second - apply changes
				for (let i = 3; i < args.length; i++) {
					const arg = args[i].toUpperCase();
					if (newAction)
						bans.addPerm(command, arg);
					else
						bans.removePerm(command, arg);
				}

				return 'Applied changes';
			}
		}
	}
});
