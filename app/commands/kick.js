
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
		
		if (!msg.member.hasPermission('KICK_MEMBERS') && msg.author.id != DBot.DBot)
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
		
		if (!msg.member.hasPermission('BAN_MEMBERS') && msg.author.id != DBot.DBot)
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

DBot.RegisterCommand({
	name: 'off',
	
	help_args: '<user1> ...',
	desc: 'Offs user(s) in current channel (text chat)',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!me) {
			msg.reply('<internal pony error>');
			return;
		}
		
		if (!msg.member.hasPermission('MANAGE_MESSAGES') && msg.author.id != DBot.DBot)
			return 'You must have `MANAGE_MESSAGES` permission ;n;';
		
		if (!me.hasPermission('MANAGE_MESSAGES'))
			return 'I must have `MANAGE_MESSAGES` permission ;n;';
		
		if (typeof args[0] != 'object')
			return DBot.CommandError('You need to specify at least one user', 'off', args, 1);
		
		let found = [];
		let server = msg.channel.guild;
		
		for (let i in args) {
			let arg = args[i];
			i = Number(i);
			
			if (typeof arg != 'object')
				return DBot.CommandError('Invalid user ;n;', 'off', args, i + 1);
			
			let member = server.member(arg);
			
			if (!member)
				return DBot.CommandError('Invalid user ;n;', 'off', args, i + 1);
			
			member.offs = member.offs || [];
			
			if (member.user.id == msg.author.id || member.user.id == DBot.bot.user.id || member.user.id == DBot.DBot)
				return DBot.CommandError('what', 'off', args, i + 1);
			
			if (member.offs.includes(msg.channel.uid))
				return DBot.CommandError('User is already turned off! (' + (member.nickname || member.user.username) + ')', 'off', args, i + 1);
			
			found.push(member);
		}
		
		let output = 'Will remove all new messages from: ';
		
		for (let member of found) {
			output += '<@' + member.user.id + '> ';
			member.offs.push(msg.channel.uid);
			
			Postgres.query('INSERT INTO off_users VALUES (' + member.uid + ', ' + msg.channel.uid + ') ON CONFLICT ("ID", "CHANNEL") DO NOTHING');
		}
		
		return output;
	}
});

DBot.RegisterCommand({
	name: 'deoff',
	alias: ['unoff', 'uoff', 'doff', 'on'],
	
	help_args: '<user1> ...',
	desc: 'Unoffs user(s) in current channel (text chat)',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!me) {
			msg.reply('<internal pony error>');
			return;
		}
		
		if (!msg.member.hasPermission('MANAGE_MESSAGES') && msg.author.id != DBot.DBot)
			return 'You must have `MANAGE_MESSAGES` permission ;n;';
		
		if (!me.hasPermission('MANAGE_MESSAGES'))
			return 'I must have `MANAGE_MESSAGES` permission ;n;';
		
		if (typeof args[0] != 'object')
			return DBot.CommandError('You need to specify at least one user', 'deoff', args, 1);
		
		let found = [];
		let server = msg.channel.guild;
		
		for (let i in args) {
			let arg = args[i];
			i = Number(i);
			
			if (typeof arg != 'object')
				return DBot.CommandError('Invalid user ;n;', 'deoff', args, i + 1);
			
			let member = server.member(arg);
			
			if (!member)
				return DBot.CommandError('Invalid user ;n;', 'deoff', args, i + 1);
			
			member.offs = member.offs || [];
			
			if (member.user.id == msg.author.id || member.user.id == DBot.bot.user.id || member.user.id == DBot.DBot)
				return DBot.CommandError('what', 'deoff', args, i + 1);
			
			if (!member.offs.includes(msg.channel.uid))
				return DBot.CommandError('User is already not off! (' + (member.nickname || member.user.username) + ')', 'deoff', args, i + 1);
			
			found.push(member);
		}
		
		let output = 'Will stop removing all new messages from: ';
		
		for (let member of found) {
			output += '<@' + member.user.id + '> ';
			
			for (let I in member.offs) {
				if (member.offs[I] == msg.channel.uid) {
					member.offs.splice(I, 1);
					break;
				}
			}
			
			Postgres.query('DELETE FROM off_users WHERE "ID" =' + member.uid + ' AND "CHANNEL" = ' + msg.channel.uid);
		}
		
		return output;
	}
});

let INIT = false;

hook.Add('PreOnValidMessage', 'ModerationCommands', function(msg) {
	if (DBot.IsPM(msg))
		return;
	
	if (!msg.member)
		return;
	
	if (!msg.member.offs)
		return;
	
	if (msg.member.offs.includes(msg.channel.uid)) {
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!me)
			return;
		
		if (!me.hasPermission('MANAGE_MESSAGES'))
			return;
		
		let identify = DBot.IdentifyCommand(msg);
		
		if ((identify == 'off' || identify == 'deoff') && msg.member.hasPermission('MANAGE_MESSAGES'))
			return;
		
		msg.author.sendMessage('You are muted in this channel by moderator');
		msg.delete();
		return true;
	}
});

hook.Add('MemberInitialized', 'ModerationCommands', function(member) {
	if (!INIT)
		return;
	
	member.offs = [];
	
	Postgres.query('SELECT CHANNEL FROM off_users WHERE last_seen."ID" = ' + member.uid, function(err, data) {
		for (let row of data) {
			member.offs.push(row.CHANNEL);
		}
	});
});

hook.Add('MembersInitialized', 'ModerationCommands', function() {
	let memberMap = [];
	
	for (let member of DBot.GetMembers()) {
		memberMap[member.uid] = member;
	}
	
	Postgres.query('SELECT * FROM off_users, last_seen WHERE last_seen."ID" = off_users."ID" AND last_seen."TIME" > currtime() - 120', function(err, data) {
		for (let row of data) {
			let member = memberMap[row.ID];
			
			if (!member)
				continue;
			
			member.offs = member.offs || [];
			member.offs.push(row.CHANNEL);
		}
	});
});
