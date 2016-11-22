
module.exports = {
	name: 'bantag',
	alias: ['btag'],
	
	help_args: '<realm: server/channel/client> <space> <tags to ban>',
	desc: 'Bans a tag from space. Banning tags from server/channel requires you server owner rights.\nWhen banning in PM, realm is always client and not used as argument, first argument is space.',
	
	func: function(args, cmd, rawcmd, msg) {
		if (!DBot.IsPM(msg)) {
			// Channel and Server realm
			
			var realm = args[0];
			var space = args[1];
			var firstTag = args[2];
			
			if (!realm)
				return 'Invalid realm. Valid are: server, client and channel';
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			if (!firstTag)
				return 'You need at least one tag to ban';
			
			realm = realm.toLowerCase();
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return 'Invalid realm. Valid are: server, client and channel';
			
			if (realm == 'client') {
				var Tags = DBot.UserTags(msg.author, space);
				
				var success = [];
				var fail = [];
				
				for (i = 2; i < args.length; i++) {
					var status = Tags.banTag(args[i].toLowerCase());
					
					if (status)
						success.push(args[i]);
					else
						fail.push(args[i]);
				}
				
				return 'Ban result from space ' + space + '\nBanned tags from you: ' + DBot.ConcatArray(success, ', ') + '\nFailed to ban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means tag already banned!';
			} else if (realm == 'channel') {
				if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least MANAGE_CHANNELS permission to command me to do that :s';
				
				var Tags = DBot.ChannelTags(msg.channel, space);
				
				var success = [];
				var fail = [];
				
				for (i = 2; i < args.length; i++) {
					var status = Tags.banTag(args[i].toLowerCase());
					
					if (status)
						success.push(args[i]);
					else
						fail.push(args[i]);
				}
				
				return 'Ban result from space ' + space + '\nBanned tags from this channel: ' + DBot.ConcatArray(success, ', ') + '\nFailed to ban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means tag already banned!';
			} else if (realm == 'server') {
				if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least MANAGE_GUILD permission to command me to do that :s';
				
				var Tags = DBot.ServerTags(msg.channel.guild, space);
				
				var success = [];
				var fail = [];
				
				for (i = 2; i < args.length; i++) {
					var status = Tags.banTag(args[i].toLowerCase());
					
					if (status)
						success.push(args[i]);
					else
						fail.push(args[i]);
				}
				
				return 'Ban result from space ' + space + '\nBanned tags from this channel: ' + DBot.ConcatArray(success, ', ') + '\nFailed to ban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means tag already banned!';
			}
		} else {
			// Clientonly realm
			
			var space = args[0];
			var firstTag = args[1];
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			if (!firstTag)
				return 'You need at least one tag to ban';
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			var Tags = DBot.UserTags(msg.author, space);
			
			var success = [];
			var fail = [];
			
			for (i = 1; i < args.length; i++) {
				var status = Tags.banTag(args[i].toLowerCase());
				
				if (status)
					success.push(args[i]);
				else
					fail.push(args[i]);
			}
			
			return 'Ban result from space ' + space + '\nBanned tags from you: ' + DBot.ConcatArray(success, ', ') + '\nFailed to ban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means tag already banned!';
		}	
	}
}
