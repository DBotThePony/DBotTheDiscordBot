
module.exports = {
	name: 'cban',
	alias: ['bancommand', 'bancomm', 'commban', 'commandban'],
	
	help_args: '<realm: server/channel> <command(s)>',
	desc: 'Bans a command from using on this channel/server\nServer owner only\nSome of commands can not be banned or unbanned',
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg)) {
			return 'Onoh! This is PM channel! ;n;';
		}
		
		var realm = args[0];
		var command = args[1];
		
		if (!realm || realm != 'server' && realm != 'channel')
			return 'Realm must be server or channel';
		
		if (!command || !DBot.Commands[command])
			return 'Unknown command to ban ;w;';
		
		if (realm == 'server') {
			if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
				return 'Onoh! You must have at least MANAGE_GUILD permission to command me to do that :s';
			
			var cBans = DBot.ServerCBans(msg.channel.guild);
			
			var success = [];
			var fail = [];
			
			for (i = 1; i < args.length; i++) {
				var id = args[i].toLowerCase();
				var data = DBot.Commands[id];
				
				if (!data) {
					fail.push(id);
					continue;
				}
				
				if (data.id != id && data.name != id) {
					id = data.id;
				}
				
				if (!DBot.HaveValue(DBot.DisallowCommandManipulate, id)) {
					var status = cBans.ban(id);
					
					if (status)
						success.push(id);
					else
						fail.push(id);
				} else
					fail.push(id);
			}
			
			return '\nBanned commands on server: ' + DBot.ConcatArray(success, ', ') + '\nFailed to ban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
		} else {
			if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.author.id != DBot.DBot)
				return 'Onoh! You must have at least MANAGE_CHANNELS permission to command me to do that :s';
			
			var cBans = DBot.ChannelCBans(msg.channel);
			
			var success = [];
			var fail = [];
			
			for (i = 1; i < args.length; i++) {
				var id = args[i].toLowerCase();
				var data = DBot.Commands[id];
				
				if (!data) {
					fail.push(id);
					continue;
				}
				
				if (data.id != id && data.name != id) {
					id = data.id;
				}
				
				if (!DBot.HaveValue(DBot.DisallowCommandManipulate, id)) {
					var status = cBans.ban(id);
					
					if (status)
						success.push(id);
					else
						fail.push(id);
				} else
					fail.push(id);
			}
			
			return '\nBanned commands on channel: ' + DBot.ConcatArray(success, ', ') + '\nFailed to ban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means command already banned, or not allowed to be banned!';
		}
	},
}