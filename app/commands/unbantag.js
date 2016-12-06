
module.exports = {
	name: 'unbantag',
	alias: ['ubantag', 'ubtag'],
	
	help_args: '<realm: server/channel/client> <space> <tags to ban>',
	desc: 'Unbans a tag from space. Unbanning tags from server/channel requires you server owner rights.\nWhile send in PM, not needed to tell realm.',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg)) {
			var realm = args[0];
			var space = args[1];
			var firstTag = args[2];
			
			if (!realm)
				return 'Invalid realm. Valid are: server, client and channel' + Util.HighlightHelp(['unbantag'], 2, args);
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['unbantag'], 3, args);
			
			if (!firstTag)
				return 'You need at least one tag to ban' + Util.HighlightHelp(['unbantag'], 4, args);
			
			realm = realm.toLowerCase();
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['unbantag'], 3, args);
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return 'Invalid realm. Valid are: server, client and channel' + Util.HighlightHelp(['unbantag'], 2, args);
			
			if (realm == 'channel') {
				if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least MANAGE_CHANNELS permission to command me to do that :s';
				
				var Tags = DBot.ChannelTags(msg.channel, space);
				
				var success = [];
				var fail = [];
				
				for (i = 2; i < args.length; i++) {
					var status = Tags.unBan(args[i].toLowerCase());
					
					if (status)
						success.push(args[i]);
					else
						fail.push(args[i]);
				}
				
				return 'Unban result from space ' + space + '\nUnbanned tags from this channel: ' + DBot.ConcatArray(success, ', ') + '\nFailed to unban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means tag was not banned!';
			} else if (realm == 'server') {
				if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least MANAGE_GUILD permission to command me to do that :s';
				
				var Tags = DBot.ServerTags(msg.channel.guild, space);
				
				var success = [];
				var fail = [];
				
				for (i = 2; i < args.length; i++) {
					var status = Tags.unBan(args[i].toLowerCase());
					
					if (status)
						success.push(args[i]);
					else
						fail.push(args[i]);
				}
				
				return 'Unban result from space ' + space + '\nUnbanned tags from this channel: ' + DBot.ConcatArray(success, ', ') + '\nFailed to unban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means tag was not banned!';
			}
		} else {
			var space = args[0];
			var firstTag = args[1];
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['unbantag'], 2, args);
			
			if (!firstTag)
				return 'You need at least one tag to ban' + Util.HighlightHelp(['unbantag'], 3, args);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces() + Util.HighlightHelp(['unbantag'], 2, args);
			
			var Tags = DBot.UserTags(msg.author, space);
			
			var success = [];
			var fail = [];
			
			for (i = 1; i < args.length; i++) {
				var status = Tags.unBan(args[i].toLowerCase());
				
				if (status)
					success.push(args[i]);
				else
					fail.push(args[i]);
			}
			
			return 'Unban result from space ' + space + '\nUnbanned tags from you: ' + DBot.ConcatArray(success, ', ') + '\nFailed to unban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means tag was not banned!';
		}
	}
}
