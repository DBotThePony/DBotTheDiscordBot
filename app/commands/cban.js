
module.exports = {
	name: 'cban',
	alias: ['bancommand', 'bancomm', 'commban', 'commandban'],
	
	help_args: '<realm: server/channel> <command(s)>',
	desc: 'Bans a command from using on this channel/server\nServer owner only\nSome of commands can not be banned or unbanned',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg)) {
			return 'Onoh! This is PM channel! ;n;';
		}
		
		let realm = args[0];
		let command = args[1];
		
		if (!realm || realm != 'server' && realm != 'channel' && realm != 'member')
			return 'Realm must be server, channel or member';
		
		if (realm == 'member')
			command = args[2];
		
		if (!command || !DBot.Commands[command])
			return 'Unknown command to ban ;w;';
		
		if (realm == 'server') {
			if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
				return 'Onoh! You must have at least `MANAGE_GUILD` permission to command me to do that :s';
			
			let cBans = DBot.ServerCBans(msg.channel.guild);
			
			let success = [];
			let fail = [];
			
			for (i = 1; i < args.length; i++) {
				let id = args[i].toLowerCase();
				let data = DBot.Commands[id];
				
				if (!data) {
					fail.push(id);
					continue;
				}
				
				if (data.id != id && data.name != id) {
					id = data.id;
				}
				
				if (!DBot.HaveValue(DBot.DisallowCommandManipulate, id)) {
					let status = cBans.ban(id);
					
					if (status)
						success.push(id);
					else
						fail.push(id);
				} else
					fail.push(id);
			}
			
			return '\nBanned commands on server: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
		} else if (realm == 'member') {
			if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
				return 'Onoh! You must have at least `MANAGE_GUILD` permission to command me to do that :s';
			
			if (typeof args[1] != 'object')
				return DBot.CommandError('Must be an @User', 'cban', args, 2);
			
			let getUser = msg.channel.guild.member(args[1]);
			
			if (!getUser)
				return DBot.CommandError('Must be an @User', 'cban', args, 2);
			
			let cBans = DBot.MemberCBans(getUser);
			
			let success = [];
			let fail = [];
			
			for (i = 2; i < args.length; i++) {
				let id = args[i].toLowerCase();
				let data = DBot.Commands[id];
				
				if (!data) {
					fail.push(id);
					continue;
				}
				
				if (data.id != id && data.name != id) {
					id = data.id;
				}
				
				if (!DBot.HaveValue(DBot.DisallowCommandManipulate, id)) {
					let status = cBans.ban(id);
					
					if (status)
						success.push(id);
					else
						fail.push(id);
				} else
					fail.push(id);
			}
			
			return '\nBanned commands from user @' + (getUser.nickname || getUser.user.username) + ': ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
		} else {
			if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.author.id != DBot.DBot)
				return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
			
			let cBans = DBot.ChannelCBans(msg.channel);
			
			let success = [];
			let fail = [];
			
			for (i = 1; i < args.length; i++) {
				let id = args[i].toLowerCase();
				let data = DBot.Commands[id];
				
				if (!data) {
					fail.push(id);
					continue;
				}
				
				if (data.id != id && data.name != id) {
					id = data.id;
				}
				
				if (!DBot.HaveValue(DBot.DisallowCommandManipulate, id)) {
					let status = cBans.ban(id);
					
					if (status)
						success.push(id);
					else
						fail.push(id);
				} else
					fail.push(id);
			}
			
			return '\nBanned commands on channel: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
		}
	},
}

DBot.RegisterCommand({
	name: 'cuban',
	alias: ['unbancommand', 'unbancomm', 'communban', 'commandunban'],
	
	help_args: '<realm: server/channel/member> <command(s)>',
	desc: 'Unbans a command from using on this channel/server/member\nServer owner only\nSome of commands can not be banned or unbanned',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg)) {
			return 'Onoh! This is PM channel!';
		}
		
		let realm = args[0];
		let command = args[1];
		
		if (!realm || realm != 'server' && realm != 'channel' && realm != 'member')
			return 'Realm must be server, channel or member';
		
		if (realm == 'member')
			command = args[2];
		
		if (!command || !DBot.Commands[command])
			return 'Unknown command to ban ;w;';
		
		if (realm == 'server') {
			if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
				return 'Onoh! You must have at least `MANAGE_GUILD` permission to command me to do that :s';
			
			let cBans = DBot.ServerCBans(msg.channel.guild);
			
			let success = [];
			let fail = [];
			
			for (i = 1; i < args.length; i++) {
				let id = args[i].toLowerCase();
				let data = DBot.Commands[id];
				
				if (!data) {
					fail.push(id);
					continue;
				}
				
				if (data.id != id && data.name != id) {
					id = data.id;
				}
				
				if (!DBot.HaveValue(DBot.DisallowCommandManipulate, id)) {
					let status = cBans.unBan(id);
					
					if (status)
						success.push(id);
					else
						fail.push(id);
				} else
					fail.push(id);
			}
			
			return '\nUnbanned commands on server: ' + DBot.ConcatArray(success, ', ') + '\nFailed to ban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means command already unbanned, or not allowed to be unbanned!';
		} else if (realm == 'member') {
			if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
				return 'Onoh! You must have at least `MANAGE_GUILD` permission to command me to do that :s';
			
			if (typeof args[1] != 'object')
				return DBot.CommandError('Must be an @User', 'cuban', args, 2);
			
			let getUser = msg.channel.guild.member(args[1]);
			
			if (!getUser)
				return DBot.CommandError('Must be an @User', 'cuban', args, 2);
			
			let cBans = DBot.MemberCBans(getUser);
			
			let success = [];
			let fail = [];
			
			for (i = 2; i < args.length; i++) {
				let id = args[i].toLowerCase();
				let data = DBot.Commands[id];
				
				if (!data) {
					fail.push(id);
					continue;
				}
				
				if (data.id != id && data.name != id) {
					id = data.id;
				}
				
				if (!DBot.HaveValue(DBot.DisallowCommandManipulate, id)) {
					let status = cBans.unBan(id);
					
					if (status)
						success.push(id);
					else
						fail.push(id);
				} else
					fail.push(id);
			}
			
			return '\nBanned commands from user @' + (getUser.nickname || getUser.user.username) + ': ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
		}  else {
			if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.author.id != DBot.DBot)
				return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
			
			let cBans = DBot.ChannelCBans(msg.channel);
			
			let success = [];
			let fail = [];
			
			for (i = 1; i < args.length; i++) {
				let id = args[i].toLowerCase();
				let data = DBot.Commands[id];
				
				if (!data) {
					fail.push(id);
					continue;
				}
				
				if (data.id != id && data.name != id) {
					id = data.id;
				}
				
				if (!DBot.HaveValue(DBot.DisallowCommandManipulate, id)) {
					let status = cBans.unBan(id);
					
					if (status)
						success.push(id);
					else
						fail.push(id);
				} else
					fail.push(id);
			}
			
			return '\nUnbanned commands on channel: ' + DBot.ConcatArray(success, ', ') + '\nFailed to ban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means command already unbanned, or not allowed to be unbanned!';
		}
	},
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
		
		if (typeof args[0] != 'object') {
			let cBans1 = DBot.ServerCBans(msg.channel.guild);
			let cBans2 = DBot.ChannelCBans(msg.channel);
			
			let output = '\nCommands banned on this server:\n';
			
			if (cBans1.bans[0]) {
				output += '```' + DBot.ConcatArray(cBans1.bans, ', ') + '```\n';
			} else {
				output += '<No bans>\n';
			}
			
			output += 'Commands banned on this channel:\n'
			
			if (cBans2.bans[0]) {
				output += '```' + DBot.ConcatArray(cBans2.bans, ', ') + '```\n';
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
	},
});
