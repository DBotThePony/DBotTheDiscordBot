
module.exports = {
	name: 'listtag',
	alias: ['taglist', 'tagslist', 'listtags'],
	
	help_args: '<realm: server/channel/client> <space>',
	desc: 'Lists tag bans\nWhen asking in PM, not need to specify realm, it is always client.',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg)) {
			var realm = args[0];
			var space = args[1];
			
			if (!realm)
				return 'Invalid realm. Valid are: server, client and channel' + Util.HighlightHelp(['listtag'], 2, args);
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['listtag'], 3, args);
			
			realm = realm.toLowerCase();
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['listtag'], 3, args);
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return 'Invalid realm. Valid are: server, client and channel';
			
			if (realm != 'client' && DBot.IsPM(msg))
				return 'What you are trying to do with this in PM?';
			
			if (realm == 'client') {
				var Tags = DBot.UserTags(msg.author, space);
				return 'Banned tags from you in ' + space + ': ' + DBot.ConcatArray(Tags.bans, ', ');
			} else if (realm == 'channel') {
				var Tags = DBot.ChannelTags(msg.channel, space);
				return 'Banned tags from this channel in ' + space + ': ' + DBot.ConcatArray(Tags.bans, ', ');
			} else if (realm == 'server') {
				var Tags = DBot.ServerTags(msg.channel.guild, space);
				return 'Banned tags from this server in ' + space + ': ' + DBot.ConcatArray(Tags.bans, ', ');
			}
		} else {
			var space = args[0];
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['listtag'], 2, args);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['listtag'], 2, args);
			
			var Tags = DBot.UserTags(msg.author, space);
			return 'Banned tags from you in ' + space + ': ' + DBot.ConcatArray(Tags.bans, ', ');
		}
	}
}
