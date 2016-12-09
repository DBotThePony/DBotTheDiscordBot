
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
