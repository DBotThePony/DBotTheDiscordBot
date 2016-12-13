
module.exports = {
	name: 'bantag',
	alias: ['btag'],
	
	help_args: '<realm: server/channel/client> <space> <tags to ban>',
	desc: 'Bans a tag from space. Banning tags from server/channel requires you server owner rights.\nWhen banning in PM, realm is always client and not used as argument, first argument is space.',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg)) {
			// Channel and Server realm
			
			let realm = args[0];
			let space = args[1];
			let firstTag = args[2];
			
			if (!realm)
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'bantag', args, 1);
			
			realm = realm.toLowerCase();
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'bantag', args, 1);
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'bantag', args, 2);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'bantag', args, 2);
			
			if (!firstTag)
				return DBot.CommandError('You need at least one tag to ban', 'bantag', args, 3);
			
			let Tags;
			
			if (realm == 'client') {
				Tags = DBot.UserTags(msg.author, space);
			} else if (realm == 'channel') {
				if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least MANAGE_CHANNELS permission to command me to do that :s';
				
				Tags = DBot.ChannelTags(msg.channel, space);
			} else if (realm == 'server') {
				if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least MANAGE_GUILD permission to command me to do that :s';
				
				Tags = DBot.ServerTags(msg.channel.guild, space);
			}
			
			let success = [];
			let fail = [];
			
			for (i = 2; i < args.length; i++) {
				let status = Tags.banTag(args[i].toLowerCase());
				
				if (status)
					success.push(args[i]);
				else
					fail.push(args[i]);
			}
			
			if (realm == 'client')
				return 'Ban result from space ' + space + '\nBanned tags from you: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means tag already banned!';
			else if (realm == 'channel')
				return 'Ban result from space ' + space + '\nBanned tags from this channel: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means tag already banned!';
			else
				return 'Ban result from space ' + space + '\nBanned tags from this server: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means tag already banned!';
		} else {
			// Clientonly realm
			
			let space = args[0];
			let firstTag = args[1];
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'bantag', args, 1);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'bantag', args, 1);
			
			if (!firstTag)
				return DBot.CommandError('You need at least one tag to ban', 'bantag', args, 2);
			
			let Tags = DBot.UserTags(msg.author, space);
			
			let success = [];
			let fail = [];
			
			for (i = 1; i < args.length; i++) {
				let status = Tags.banTag(args[i].toLowerCase());
				
				if (status)
					success.push(args[i]);
				else
					fail.push(args[i]);
			}
			
			return 'Ban result from space ' + space + '\nBanned tags from you: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means tag already banned!';
		}	
	}
}

DBot.RegisterCommand({
	name: 'unbantag',
	alias: ['ubantag', 'ubtag'],
	
	help_args: '<realm: server/channel/client> <space> <tags to unban>',
	desc: 'Unbans a tag from space. Unbanning tags from server/channel requires you server owner rights.\nWhile send in PM, not needed to tell realm.',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg)) {
			let realm = args[0];
			let space = args[1];
			let firstTag = args[2];
			
			if (!realm)
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'unbantag', args, 1);
			
			realm = realm.toLowerCase();
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'unbantag', args, 1);
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'unbantag', args, 2);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'unbantag', args, 2);
			
			if (!firstTag)
				return DBot.CommandError('You need at least one tag to unban', 'unbantag', args, 3);
			
			let Tags;
			
			if (realm == 'client') {
				Tags = DBot.UserTags(msg.author, space);
			} else if (realm == 'channel') {
				if (!msg.member.hasPermission('MANAGE_CHANNELS') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
				
				Tags = DBot.ChannelTags(msg.channel, space);
			} else if (realm == 'server') {
				if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
					return 'Onoh! You must have at least `MANAGE_GUILD` permission to command me to do that :s';
				
				Tags = DBot.ServerTags(msg.channel.guild, space);
			}
			
			let success = [];
			let fail = [];
			
			for (i = 2; i < args.length; i++) {
				let status = Tags.unBan(args[i].toLowerCase());
				
				if (status)
					success.push(args[i]);
				else
					fail.push(args[i]);
			}
			
			if (realm == 'client')
				return 'Unban result from space ' + space + '\nUnbanned tags from you: ' + success.join(', ') + '\nFailed to unban: ' + fail.join(', ') + '\nIf there is failures - that means tag is not banned!';
			else if (realm == 'channel')
				return 'Unban result from space ' + space + '\nUnbanned tags from this channel: ' + success.join(', ') + '\nFailed to unban: ' + fail.join(', ') + '\nIf there is failures - that means tag is not banned!';
			else
				return 'Unban result from space ' + space + '\nUnbanned tags from this server: ' + success.join(', ') + '\nFailed to unban: ' + fail.join(', ') + '\nIf there is failures - that means tag is not banned!';
		} else {
			let space = args[0];
			let firstTag = args[1];
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'unbantag', args, 1);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'unbantag', args, 1);
			
			if (!firstTag)
				return DBot.CommandError('You need at least one tag to ban', 'unbantag', args, 2);
			
			let Tags = DBot.UserTags(msg.author, space);
			
			let success = [];
			let fail = [];
			
			for (i = 1; i < args.length; i++) {
				let status = Tags.banTag(args[i].toLowerCase());
				
				if (status)
					success.push(args[i]);
				else
					fail.push(args[i]);
			}
			
			return 'Unban result from space ' + space + '\nUnbanned tags from you: ' + success.join(', ') + '\nFailed to unban: ' + fail.join(', ') + '\nIf there is failures - that means tag is not banned!';
		}
	}
});

DBot.RegisterCommand({
	name: 'listtag',
	alias: ['taglist', 'tagslist', 'listtags'],
	
	help_args: '<realm: server/channel/client> <space>',
	desc: 'Lists tag bans\nWhen asking in PM, not need to specify realm, it is always client.',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg)) {
			let realm = args[0];
			let space = args[1];
			
			if (!realm)
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'listtag', args, 1);
			
			realm = realm.toLowerCase();
			
			if (realm != 'client' && realm != 'server' && realm != 'channel')
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'listtag', args, 1);
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'listtag', args, 2);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'listtag', args, 2);
			
			if (realm != 'client' && DBot.IsPM(msg))
				return 'What you are trying to do with this in PM? x3';
			
			if (realm == 'client') {
				return 'Banned tags from you in ' + space + ': ```' + DBot.UserTags(msg.author, space).bans.join(', ');
			} else if (realm == 'channel') {
				return 'Banned tags from this channel in ' + space + ': ' + DBot.ChannelTags(msg.channel, space).bans.join(', ');
			} else if (realm == 'server') {
				return 'Banned tags from this server in ' + space + ': ' + DBot.ServerTags(msg.channel.guild, space).bans.join(', ');
			}
		} else {
			let space = args[1];
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'listtag', args, 1);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'listtag', args, 1);
			
			return 'Banned tags from you in ' + space + ': ```' + DBot.UserTags(msg.author, space).bans.join(', ');
		}
	}
});
