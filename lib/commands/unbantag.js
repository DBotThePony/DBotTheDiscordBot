
module.exports = {
	name: 'unbantag',
	alias: ['ubantag', 'ubtag'],
	
	help_args: '<realm: server/channel/client> <space> <tags to ban>',
	desc: 'Unbans a tag from space. Unbanning tags from server/channel requires you server owner rights.\nWhile send in PM, not needed to tell realm.',
	
	func: function(args, cmd, rawcmd, msg) {
		if (!DBot.IsPM(msg)) {
			var realm = args[0];
			var space = args[1];
			var firstTag = args[2];
			
			if (!realm)
				return 'Invalid realm. Valid are: server, client and channel';
			
			if (!space)
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			if (!firstTag)
				return 'You need at least one tag to unban';
			
			realm = realm.toLowerCase();
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return 'Invalid realm. Valid are: server, client and channel';
			
			if (realm != 'client' && DBot.IsPM(msg))
				return 'What you are trying to do with this in PM?';
			
			if (realm != 'client' && !DBot.MessageByServerOwner(msg))
				return 'You must be server owner to do that with ponies';
			
			if (realm == 'client') {
				var Tags = DBot.UserTags(msg.author, space);
				
				var success = [];
				var fail = [];
				
				for (i = 2; i < args.length; i++) {
					var status = Tags.unBan(args[i].toLowerCase());
					
					if (status)
						success.push(args[i]);
					else
						fail.push(args[i]);
				}
				
				return 'Unban result from space ' + space + '\nUnbanned tags from you: ' + DBot.ConcatArray(success, ', ') + '\nFailed to unban: ' + DBot.ConcatArray(fail, ', ') + '\nIf there is failures - that means tag was not banned!';
			} else if (realm == 'channel') {
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
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
			if (!firstTag)
				return 'You need at least one tag to unban';
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return 'Invalid space. Valid are: ' + DBot.ValidTagSpaces();
			
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
