
/* global DBot */

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
			
			if (realm !== 'client' && realm !== 'server' && realm !== 'channel')
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'bantag', args, 1);
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'bantag', args, 2);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'bantag', args, 2);
			
			if (!firstTag)
				return DBot.CommandError('You need at least one tag to ban', 'bantag', args, 3);
			
			let Tags;
			
			if (realm === 'client') {
				Tags = DBot.UserTags(msg.author, space);
			} else if (realm === 'channel') {
				if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
					return 'Onoh! You must have at least MANAGE_CHANNELS permission to command me to do that :s';
				
				Tags = DBot.ChannelTags(msg.channel, space);
			} else if (realm === 'server') {
				if (!msg.member.hasPermission('MANAGE_GUILD') && !DBot.owners.includes(msg.author.id))
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
			
			if (realm === 'client')
				return 'Ban result from space ' + space + '\nBanned tags from you: ' + success.join(', ') + '\nFailed to ban: ' + fail.join(', ') + '\nIf there is failures - that means tag already banned!';
			else if (realm === 'channel')
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
};

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
			
			if (realm !== 'client' && realm !== 'server' && realm !== 'channel')
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'unbantag', args, 1);
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'unbantag', args, 2);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'unbantag', args, 2);
			
			if (!firstTag)
				return DBot.CommandError('You need at least one tag to unban', 'unbantag', args, 3);
			
			let Tags;
			
			if (realm === 'client') {
				Tags = DBot.UserTags(msg.author, space);
			} else if (realm === 'channel') {
				if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
					return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
				
				Tags = DBot.ChannelTags(msg.channel, space);
			} else if (realm === 'server') {
				if (!msg.member.hasPermission('MANAGE_GUILD') && !DBot.owners.includes(msg.author.id))
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
			
			if (realm === 'client')
				return 'Unban result from space ' + space + '\nUnbanned tags from you: ' + success.join(', ') + '\nFailed to unban: ' + fail.join(', ') + '\nIf there is failures - that means tag is not banned!';
			else if (realm === 'channel')
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
			
			if (realm !== 'client' && realm !== 'server' && realm !== 'channel')
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'listtag', args, 1);
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'listtag', args, 2);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'listtag', args, 2);
			
			if (realm !== 'client' && DBot.IsPM(msg))
				return 'What you are trying to do with this in PM? x3';
			
			if (realm === 'client') {
				return 'Banned tags from you in ' + space + ': ```' + DBot.UserTags(msg.author, space).bans.join(', ') + '```';
			} else if (realm === 'channel') {
				return 'Banned tags from this channel in ' + space + ': ```' + DBot.ChannelTags(msg.channel, space).bans.join(', ') + '```';
			} else if (realm === 'server') {
				return 'Banned tags from this server in ' + space + ': ```' + DBot.ServerTags(msg.channel.guild, space).bans.join(', ') + '```';
			}
		} else {
			let space = args[1];
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'listtag', args, 1);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'listtag', args, 1);
			
			return 'Banned tags from you in ' + space + ': ```' + DBot.UserTags(msg.author, space).bans.join(', ') + '```';
		}
	}
});

DBot.RegisterCommand({
	name: 'rbantags',
	alias: ['resetbantags', 'rtaglist', 'resettaglist'],
	
	help_args: '<realm: server/channel/client> <space>',
	desc: 'Resets tag bans to default bans for named space. Not needed to define realm while running in PM.',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg)) {
			// Channel and Server realm
			
			let realm = args[0];
			let space = args[1];
			
			if (!realm)
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'rbantags', args, 1);
			
			realm = realm.toLowerCase();
			
			if (realm !== 'client' && realm !== 'server' && realm !== 'channel')
				return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'rbantags', args, 1);
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'rbantags', args, 2);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'rbantags', args, 2);
			
			if (realm === 'client') {
				let Tags = DBot.UserTags(msg.author, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for you successfully resetted!';
			} else if (realm === 'channel') {
				if (!msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
					return 'Onoh! You must have at least MANAGE_CHANNELS permission to command me to do that :s';
				
				let Tags = DBot.ChannelTags(msg.channel, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for this channel successfully resetted!';
			} else if (realm === 'server') {
				if (!msg.member.hasPermission('MANAGE_GUILD') && !DBot.owners.includes(msg.author.id))
					return 'Onoh! You must have at least MANAGE_GUILD permission to command me to do that :s';
				
				let Tags = DBot.ServerTags(msg.channel.guild, space);
				Tags.reset();
				
				return 'Tags for space ' + space + ' for this server successfully resetted!';
			}
		} else {
			// Clientonly realm
			
			let space = args[0];
			
			if (!space)
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'rbantags', args, 1);
			
			space = space.toLowerCase();
			
			if (!DBot.tags[space])
				return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'rbantags', args, 1);
			
			let Tags = DBot.UserTags(msg.author, space);
			Tags.reset();
			
			return 'Tags for space ' + space + ' for you successfully resetted!';
		}	
	}
});

DBot.RegisterCommand({
	name: 'tags',
	
	help_args: '<action: add/list/remove> <realm: server/channel/client> <space> <tags to ban/unban>',
	desc: 'Unbans a tag from space. Unbanning tags from server/channel requires you server owner rights.\nWhile send in PM, not needed to tell realm.',
	
	func: function(args, cmd, msg) {
		let action = args[0];
		let realm = args[1];
		let tagList = [];
		let shift = 0;
		
		if (DBot.IsPM(msg)) {
			shift = 1;
			realm = 'client';
		}
		
		for (let i = 3 - shift; i < args.length; i++) {
			tagList.push(args[i]);
		}
		
		let space = args[2 - shift];
		let tagObj;
		
		let realmID = 2 - shift;
		let spaceID = 3 - shift;
		let fTagID = 4 - shift;
		
		if (!action)
			return DBot.CommandError('Invalid action. Valid are: add, list and remove', 'tags', args, 1);
		
		action = action.toLowerCase();
		
		if (action !== 'add' && action !== 'list' && action !== 'remove' && action !== 'delete' && action !== 'rm')
			return DBot.CommandError('Invalid action. Valid are: add, list and remove', 'tags', args, 1);
		
		if (!realm)
			return DBot.CommandError('Invalid realm. Valid are: client, server or channel', 'tags', args, realmID);

		realm = realm.toLowerCase();

		if (realm !== 'client' && realm !== 'server' && realm !== 'channel')
			return DBot.CommandError('Invalid realm. Valid are: server, client and channel', 'tags', args, realmID);

		if (!space)
			return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'tags', args, spaceID);

		space = space.toLowerCase();

		if (!DBot.tags[space])
			return DBot.CommandError('Invalid space. Valid are: ' + DBot.ValidTagSpaces(), 'tags', args, spaceID);

		if (realm === 'client')
			tagObj = DBot.UserTags(msg.author, space);
		else if (realm === 'channel')
			tagObj = DBot.ChannelTags(msg.channel, space);
		else if (realm === 'server')
			tagObj = DBot.ServerTags(msg.channel.guild, space);

		if (action !== 'list') {
			if (realm !== 'client' && !msg.member.hasPermission('MANAGE_CHANNELS') && !DBot.owners.includes(msg.author.id))
				return 'Onoh! You must have at least `MANAGE_CHANNELS` permission to command me to do that :s';
			
			if (tagList.length === 0)
				return DBot.CommandError('You need at least one tag to unban', 'unbantag', args, fTagID);

			let success = [];

			for (const tag of tagList) {
				let status;

				if (action === 'remove' || action === 'rm' || action === 'delete')
					status = tagObj.unBan(tag.toLowerCase());
				else
					status = tagObj.ban(tag.toLowerCase());

				if (status)
					success.push(tag);
			}
			
			let word = 'Ban';
			
			if (action !== 'add')
				word = 'Unban';

			if (realm === 'client')
				return word + ' result from space ' + space + '\n' + word + 'ned tags from you: ' + success.join(', ');
			else if (realm === 'channel')
				return word + ' result from space ' + space + '\n' + word + 'ned tags from this channel: ' + success.join(', ');
			else
				return word + ' result from space ' + space + '\n' + word + 'ned tags from this server: ' + success.join(', ');
		} else {
			if (realm === 'client')
				return 'Banned tags from you in ' + space + ': ```' + tagObj.bans.join(', ') + '```';
			else if (realm === 'channel')
				return 'Banned tags from this channel in ' + space + ': ```' + tagObj.bans.join(', ') + '```';
			else if (realm === 'server')
				return 'Banned tags from this server in ' + space + ': ```' + tagObj.bans.join(', ') + '```';
		}
	}
});