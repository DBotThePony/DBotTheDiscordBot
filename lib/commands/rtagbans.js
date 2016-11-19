
module.exports = {
	name: 'rbantags',
	alias: ['resetbantags'],
	
	help_args: '<realm: server/channel/client> <space>',
	desc: 'Resets tag bans to default bans for named space. Not needed to define realm while running in PM.',
	
	func: function(args, cmd, rawcmd, msg) {
		if (!DBot.IsPM(msg)) {
			// Channel and Server realm
			
			var realm = args[0];
			var space = args[1];
			
			if (!realm)
				return 'Invalid realm. Valid are: server, client and channel';
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			realm = realm.toLowerCase();
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return 'Invalid realm. Valid are: server, client and channel';
			
			if (realm != 'client' && !DBot.MessageByServerOwner(msg))
				return 'You must be server owner to do that with ponies';
			
			if (realm == 'client') {
				var Tags = DBot.UserTags(msg.author, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for you successfully resetted!';
			} else if (realm == 'channel') {
				var Tags = DBot.ChannelTags(msg.channel, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for this channel successfully resetted!';
			} else if (realm == 'server') {
				var Tags = DBot.ServerTags(msg.channel.guild, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for this server successfully resetted!';
			}
		} else {
			// Clientonly realm
			
			var space = args[0];
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			var Tags = DBot.UserTags(msg.author, space);
			Tags.reset();
			
			return 'Tags for space ' + space + ' for you successfully resetted!';
		}	
	}
}
