
module.exports = {
	name: 'role',
	
	help_args: '<role name>',
	desc: 'Prints info about role',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'role', args, 1);
		
		let role;
		let find = args[0].toLowerCase();
		
		for (let rl of msg.channel.guild.roles.array()) {
			if (rl.name.toLowerCase().match(find)) {
				role = rl;
				break;
			}
		}
		
		if (!role)
			return DBot.CommandError('No such role', 'role', args, 1);
		
		let perms = [];
		let s = role.serialize();
		
		for (let i in s) {
			if (s[i] && 
				i != 'READ_MESSAGES' && 
				i != 'SEND_MESSAGES' && 
				i != 'EMBED_LINKS' && 
				i != 'ATTACH_FILES' && 
				i != 'READ_MESSAGE_HISTORY' && 
				i != 'USE_VAD' && 
				i != 'CHANGE_NICKNAME' && 
				i != 'CREATE_INSTANT_INVITE' && 
				i != 'MENTION_EVERYONE' && 
				i != 'CONNECT' && 
				i != 'SPEAK' && 
				i != 'SEND_TTS_MESSAGES'
			) {
				perms.push(i);
			}
		}
		
		let output = '```';
		
		output += 'Role name:                     ' + role.name + '\n';
		output += 'Role ID:                       ' + role.id + '\n';
		output += 'Is mentionable:                ' + role.mentionable + '\n';
		output += 'Is hoist:                      ' + role.hoist + '\n';
		output += 'Role color:                    ' + role.color + '\n';
		
		if (perms) {
			output += 'Role permissions:              ' + perms.join(', ') + '\n';
		}
		
		output += '```';
		return output;
	}
}

DBot.RegisterCommand({
	name: 'addrole',
	
	help_args: '<role name>',
	desc: 'Adds specified role to everyone who have not any roles. Excludes bot and you.',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'role', args, 1);
		
		let role;
		let find = args[0].toLowerCase();
		
		for (let rl of msg.channel.guild.roles.array()) {
			if (rl.name.toLowerCase().match(find)) {
				role = rl;
				break;
			}
		}
		
		if (!role)
			return DBot.CommandError('No such role', 'role', args, 1);
		
		let HIT = false;
		let total = 0;
		
		for (let member of msg.channel.guild.members.array()) {
			if (member.roles.array().length == 1 && member.id != me.id && member.id != msg.member.id) {
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
		}
		
		return 'Doing role setup!\nTotal to add: ' + total;
	}
});

DBot.RegisterCommand({
	name: 'addrole_all',
	
	help_args: '<role name>',
	desc: 'Adds specified role to everyone. Excludes bot and you.',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'role', args, 1);
		
		let role;
		let find = args[0].toLowerCase();
		
		for (let rl of msg.channel.guild.roles.array()) {
			if (rl.name.toLowerCase().match(find)) {
				role = rl;
				break;
			}
		}
		
		if (!role)
			return DBot.CommandError('No such role', 'role', args, 1);
		
		let HIT = false;
		let total = 0;
		
		for (let member of msg.channel.guild.members.array()) {
			if (!member.roles.array().includes(role) && member.id != me.id && member.id != msg.member.id) {
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
		}
		
		return 'Doing role setup!\nTotal to add: ' + total;
	}
});

DBot.RegisterCommand({
	name: 'rmrole',
	alias: ['delrole'],
	
	help_args: '<role name>',
	desc: 'Removes specified role from everyone who have this role. Excludes bot and you.',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('Invalid role name', 'role', args, 1);
		
		let role;
		let find = args[0].toLowerCase();
		
		for (let rl of msg.channel.guild.roles.array()) {
			if (rl.name.toLowerCase().match(find)) {
				role = rl;
				break;
			}
		}
		
		if (!role)
			return DBot.CommandError('No such role', 'role', args, 1);
		
		let HIT = false;
		
		let total = 0;
		
		for (let member of msg.channel.guild.members.array()) {
			if (member.roles.array().includes(role) && member.id != me.id && member.id != msg.member.id) {
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
					msg.reply('Unable to set role for <@' + (member.id) + '>. All further errors would not be shown.');
				});
			}
		}
		
		return 'Doing role remove!\nTotal to remove: ' + total;
	}
});
