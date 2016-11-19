
module.exports = {
	name: 'listtag',
	alias: ['taglist', 'tagslist', 'listtags'],
	
	help_args: '<space> <realm: server/channel/client>',
	desc: 'Lists tag bans',
	
	func: function(args, cmd, rawcmd, msg) {
		var space = args[0];
		var realm = args[1];
		
		if (!space)
			return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
		
		if (!realm)
			return 'Invalid realm. Valid are: server, client and channel';
		
		realm = realm.toLowerCase();
		space = space.toLowerCase();
		
		if (!DBot.tags[space])
			return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
		
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
	}
}