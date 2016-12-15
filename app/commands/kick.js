
module.exports = {
	name: 'kick',
	
	help_args: '<user1> ...',
	desc: 'Kicks user(s)',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!me) {
			msg.reply('<internal pony error>');
			return;
		}
		
		if (!msg.member.hasPermission('KICK_MEMBERS'))
			return 'You must have `KICK_MEMBERS` permission ;n;';
		
		if (!me.hasPermission('KICK_MEMBERS'))
			return 'I must have `KICK_MEMBERS` permission ;n;';
		
		if (typeof args[0] != 'object')
			return DBot.CommandError('You need to specify at least one user', 'kick', args, 1);
		
		let found = [];
		let server = msg.channel.guild;
		
		for (let i in args) {
			let arg = args[i];
			i = Number(i);
			
			if (typeof arg != 'object')
				return DBot.CommandError('Invalid user ;n;', 'kick', args, i + 1);
			
			let member = server.member(arg);
			
			if (!member)
				return DBot.CommandError('Invalid user ;n;', 'kick', args, i + 1);
			
			if (member.user.id == msg.author.id || member.user.id == DBot.bot.user.id || member.user.id == DBot.DBot)
				return DBot.CommandError('what', 'kick', args, i + 1);
			
			if (!member.kickable)
				return DBot.CommandError('Sorry, but i am not strong enough to walk to that user and poke him (' + (member.nickname || member.user.username) + ')', 'kick', args, i + 1);
			
			found.push(member);
		}
		
		let conf = new DBot.Confirm(msg.author, msg.channel);
		
		conf.setTitle('Kicking members');
		conf.setDesc('Kick **' + found.length + '** members');
		
		conf.confirm(function() {
			msg.channel.startTyping();
			msg.reply('Kicking **' + found.length + '** members ;n; Bye ;n;');
			
			let total = found.length;
			
			for (let member of found) {
				member.kick()
				.then(function() {
					total--;
					
					if (total == 0) {
						msg.channel.stopTyping();
						msg.reply('Kicked ;n;');
					}
				})
				.catch(function() {
					total--;
					
					if (total == 0) {
						msg.channel.stopTyping();
						msg.reply('Kicked ;n;');
					}
				});
			}
		});
		
		conf.decline(function() {
			msg.reply('Aborting');
		});
		
		conf.echo();
	}
}

DBot.RegisterCommand({
	name: 'ban',
	
	help_args: '<user1> ...',
	desc: 'BANNs user(s)',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!me) {
			msg.reply('<internal pony error>');
			return;
		}
		
		if (!msg.member.hasPermission('BAN_MEMBERS'))
			return 'You must have `BAN_MEMBERS` permission ;n;';
		
		if (!me.hasPermission('BAN_MEMBERS'))
			return 'I must have `BAN_MEMBERS` permission ;n;';
		
		if (typeof args[0] != 'object')
			return DBot.CommandError('You need to specify at least one user', 'ban', args, 1);
		
		let found = [];
		let server = msg.channel.guild;
		
		for (let i in args) {
			let arg = args[i];
			i = Number(i);
			
			if (typeof arg != 'object')
				return DBot.CommandError('Invalid user ;n;', 'ban', args, i + 1);
			
			let member = server.member(arg);
			
			if (!member)
				return DBot.CommandError('Invalid user ;n;', 'ban', args, i + 1);
			
			if (member.user.id == msg.author.id || member.user.id == DBot.bot.user.id || member.user.id == DBot.DBot)
				return DBot.CommandError('what', 'ban', args, i + 1);
			
			if (!member.kickable)
				return DBot.CommandError('Sorry, but i am not strong enough to walk to that user and poke him (' + (member.nickname || member.user.username) + ')', 'ban', args, i + 1);
			
			found.push(member);
		}
		
		let conf = new DBot.Confirm(msg.author, msg.channel);
		
		conf.setTitle('Banning members');
		conf.setDesc('Ban **' + found.length + '** members');
		
		conf.confirm(function() {
			msg.channel.startTyping();
			msg.reply('Kicking **' + found.length + '** members ;n; Bye ;n;');
			
			let total = found.length;
			
			for (let member of found) {
				member.ban()
				.then(function() {
					total--;
					
					if (total == 0) {
						msg.channel.stopTyping();
						msg.reply('BANNed ;n;');
					}
				})
				.catch(function() {
					total--;
					
					if (total == 0) {
						msg.channel.stopTyping();
						msg.reply('BANNed ;n;');
					}
				});
			}
		});
		
		conf.decline(function() {
			msg.reply('Aborting');
		});
		
		conf.echo();
	}
});
