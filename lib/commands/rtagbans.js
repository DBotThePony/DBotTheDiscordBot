
module.exports = {
	name: 'rbantags',
	alias: ['resetbantags', 'rtaglist', 'resettaglist'],
	
	help_args: '<realm: server/channel/client> <space>',
	desc: 'Resets tag bans to default bans for named space. Not needed to define realm while running in PM.',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg)) {
			// Channel and Server realm
			
			var realm = args[0];
			var space = args[1];
			
			if (!realm)
				return 'Invalid realm. Valid are: server, client and channel' + Util.HighlightHelp(['rbantags'], 2, args);
			
			realm = realm.toLowerCase();
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return 'Invalid realm. Valid are: server, client and channel' + Util.HighlightHelp(['rbantags'], 2, args);
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['rbantags'], 3, args);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['rbantags'], 3, args);
			
			if (realm == 'client') {
				var Tags = DBot.UserTags(msg.author, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for you successfully resetted!';
			} else if (realm == 'channel') {
				if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least MANAGE_CHANNELS permission to command me to do that :s';
				
				var Tags = DBot.ChannelTags(msg.channel, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for this channel successfully resetted!';
			} else if (realm == 'server') {
				if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least MANAGE_GUILD permission to command me to do that :s';
				
				var Tags = DBot.ServerTags(msg.channel.guild, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for this server successfully resetted!';
			}
		} else {
			// Clientonly realm
			
			var space = args[0];
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['rbantags'], 2, args);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['rbantags'], 2, args);
			
			var Tags = DBot.UserTags(msg.author, space);
			Tags.reset();
			
			return 'Tags for space ' + space + ' for you successfully resetted!';
		}	
	}
}
