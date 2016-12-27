
const moment = require('moment');
const hDuration = require('humanize-duration');
const fs = DBot.fs;
Util.mkdir(DBot.WebRoot + '/blogs');

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
			
			if (!DBot.CanTarget(msg.member, member))
				return DBot.CommandError('This pone is strong enough for ya!', 'kick', args, i + 1);
			
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
	name: 'sban',
	alias: ['softban'],
	
	help_args: '<user1> ...',
	desc: 'Soft ban user(s). Soft banned users can join, but will be kicked in one second after join',
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
		
		if (!me.hasPermission('KICK_MEMBERS'))
			return 'I must have `KICK_MEMBERS` permission ;n;';
		
		if (typeof args[0] != 'object')
			return DBot.CommandError('You need to specify at least one user', 'sban', args, 1);
		
		let found = [];
		let server = msg.channel.guild;
		
		for (let i in args) {
			let arg = args[i];
			i = Number(i);
			
			if (typeof arg != 'object')
				return DBot.CommandError('Invalid user ;n;', 'sban', args, i + 1);
			
			let member = server.member(arg);
			
			if (!member)
				return DBot.CommandError('Invalid user ;n;', 'sban', args, i + 1);
			
			if (member.user.id == msg.author.id || member.user.id == DBot.bot.user.id || member.user.id == DBot.DBot)
				return DBot.CommandError('what', 'sban', args, i + 1);
			
			if (!DBot.CanTarget(msg.member, member))
				return DBot.CommandError('This pone is strong enough for ya!', 'sban', args, i + 1);
			
			if (!member.kickable)
				return DBot.CommandError('Sorry, but i am not strong enough to walk to that user and poke him (' + (member.nickname || member.user.username) + ')', 'sban', args, i + 1);
			
			found.push(member);
		}
		
		let conf = new DBot.Confirm(msg.author, msg.channel);
		
		conf.setTitle('Banning members');
		conf.setDesc('Softban **' + found.length + '** members');
		
		conf.confirm(function() {
			msg.channel.startTyping();
			msg.reply('Softban **' + found.length + '** members ;n; Bye ;n;');
			
			let total = found.length;
			
			for (let member of found) {
				Postgres.query('INSERT INTO member_softban ("ID", "ADMIN") VALUES (get_member_id(' + Util.escape(member.user.id) + ', ' + Util.escape(member.guild.id) + '), get_member_id(' + Util.escape(msg.member.user.id) + ', ' + Util.escape(msg.member.guild.id) + ')) ON CONFLICT ("ID") DO NOTHING');
				member.kick()
				
				.then(function() {
					total--;
					
					if (total == 0) {
						msg.channel.stopTyping();
						msg.reply('Softbanned ;n;');
					}
				})
				
				.catch(function() {
					total--;
					
					if (total == 0) {
						msg.channel.stopTyping();
						msg.reply('Softbanned ;n;');
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
	name: 'unsban',
	alias: ['unsoftban', 'unban', 'softunban'],
	
	help_args: '<member id 1> ...',
	desc: 'Unban users if they are were banned',
	
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
		
		if (!args[0])
			return DBot.CommandError('You need to specify at least one user', 'sban', args, 1);
		
		for (let i in args) {
			let p = Util.ToNumber(args[i]);
			
			if (!p || p <= 0)
				return DBot.CommandError('Invalid ID', 'unsban', args, Number(i) + 1);
		}
		
		Postgres.query('DELETE FROM member_softban WHERE "ID" = ANY(' + sql.Array(args) + '::INTEGER[])', function(err, data) {
			if (err) {
				console.error(err);
				msg.reply('*squeaks because of pain*');
				return;
			}
			
			msg.reply('All listed IDs was unbanned if they are was banned');
		});
	}
});

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
			
			if (!DBot.CanTarget(msg.member, member))
				return DBot.CommandError('This pone is strong enough for ya!', 'ban', args, i + 1);
			
			if (!member.kickable)
				return DBot.CommandError('Sorry, but i am not strong enough to walk to that user and poke him (' + (member.nickname || member.user.username) + ')', 'ban', args, i + 1);
			
			found.push(member);
		}
		
		let conf = new DBot.Confirm(msg.author, msg.channel);
		
		conf.setTitle('Banning members');
		conf.setDesc('Ban **' + found.length + '** members');
		
		conf.confirm(function() {
			msg.channel.startTyping();
			msg.reply('BANNing **' + found.length + '** members ;n; Bye forevar ;n;');
			
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
		
		if (!args[0])
			return DBot.CommandError('Argument is required', 'off', args, 1);
		
		if (typeof args[0] == 'object') {
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
				
				if (!DBot.CanTarget(msg.member, member))
					return DBot.CommandError('This pone is strong enough for ya!', 'off', args, i + 1);
				
				if (member.offs.includes(msg.channel.uid))
					return DBot.CommandError('User is already turned off! (' + (member.nickname || member.user.username) + ')', 'off', args, i + 1);
				
				found.push(member);
			}
			
			let output = 'Will remove all new messages from: ';
			
			for (let member of found) {
				output += '<@' + member.user.id + '> ';
				member.offs.push(msg.channel.uid);
				
				Postgres.query('INSERT INTO off_users VALUES (' + sql.Member(member) + ', ' + msg.channel.uid + ') ON CONFLICT ("ID", "CHANNEL") DO NOTHING');
			}
			
			return output;
		} else if (args[0].toLowerCase() == 'all') {
			let rCache = DBot.GetImmunityLevel(msg.member);
			
			let stream;
			let sha = DBot.HashString(CurTime() + '___' + msg.channel.guild.id + msg.channel.id);
			let path = DBot.WebRoot + '/blogs/' + sha + '.txt';
			let upath = DBot.URLRoot + '/blogs/' + sha + '.txt';
			
			for (let member of msg.channel.members.array()) {
				if (member.user.id == msg.member.id || member.user.id == DBot.bot.user.id || member.user.id == DBot.DBot || DBot.GetImmunityLevel(member) >= rCache)
					continue;
				
				member.offs = member.offs || [];
				
				if (!member.offs.includes(msg.channel.uid)) {
					if (!stream)
						stream = fs.createWriteStream(path);
					
					stream.write('<@' + member.user.id + '>     ' + Util.AppendSpaces(member.nickname || member.user.username, 60) + ' (' + member.user.username + ')\n');
					
					member.offs.push(msg.channel.uid);
					Postgres.query('INSERT INTO off_users VALUES (' + sql.Member(member) + ', ' + msg.channel.uid + ') ON CONFLICT ("ID", "CHANNEL") DO NOTHING');
				}
			}
			
			if (!stream)
				return 'Will off messages from all who you can target!';
			else {
				stream.end();
				
				stream.on('finish', function() {
					msg.reply('Will off messages from all who you can target!\n' + upath);
				});
			}
		} else {
			return DBot.CommandError('Argument must be `all` or array of users', 'off', args, 1);
		}
	}
});

DBot.RegisterCommand({
	name: 'offlist',
	
	help_args: '',
	desc: 'Prints offed users',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		let hit = false;
		let output = 'Offed on this channel: \n';
		
		let stream;
		let sha = DBot.HashString(CurTime() + '___' + msg.channel.guild.id + msg.channel.id);
		let path = DBot.WebRoot + '/blogs/' + sha + '.txt';
		let upath = DBot.URLRoot + '/blogs/' + sha + '.txt';
		
		for (let member of msg.channel.guild.members.array()) {
			if (member.offs && member.offs.includes(msg.channel.uid)) {
				output += '<@' + member.user.id + '> ';
				hit = true;
				
				if (!stream)
					stream = fs.createWriteStream(path);
				
				stream.write('<@' + member.user.id + '>     ' + Util.AppendSpaces(member.nickname || member.user.username, 60) + ' (' + member.user.username + ')\n');
			}
		}
		
		if (!hit)
			return 'No users is listed in the off list';
		
		stream.end();
		
		return 'List: ' + upath;
	}
});

DBot.RegisterCommand({
	name: 'sbans',
	alias: ['softbanslist', 'listsoftbans', 'lsbans', 'lsban', 'softbans'],
	
	help_args: '',
	desc: 'Prints softbanned users (full list)',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		let sha = DBot.HashString(CurTime() + '_softban_' + msg.channel.guild.id + msg.channel.id);
		let path = DBot.WebRoot + '/blogs/' + sha + '.txt';
		let upath = DBot.URLRoot + '/blogs/' + sha + '.txt';
		
		let fuckingQuery = '\
		SELECT\
			member_softban."ID",\
			member_softban."STAMP",\
			member_softban."ADMIN",\
			member_names."NAME" AS "ADMIN_NAME",\
			user_names."USERNAME" AS "ADMIN_NAME_REAL",\
			(SELECT member_names."NAME" FROM member_names WHERE member_names."ID" = member_softban."ID") AS "VICTIM_THAT_GOT_BANNED",\
			(SELECT user_names."USERNAME" FROM user_names, member_id WHERE member_id."ID" = member_softban."ID" AND user_names."ID" = member_id."USER") AS "BANNED_USERNAME"\
		FROM\
			member_softban,\
			member_names,\
			member_id,\
			user_names\
		WHERE\
			member_id."SERVER" = ' + msg.channel.guild.uid + ' AND\
			member_names."ID" = member_softban."ADMIN" AND\
			member_id."ID" = member_names."ID" AND\
			user_names."ID" = member_id."USER"\
		ORDER BY "STAMP" DESC';
		
		Postgres.query(fuckingQuery, function(err, data) {
			if (err) {
				console.error(err);
				msg.reply('*squeaks because of pain*');
				return;
			}
			
			if (!data[0]) {
				msg.reply('No data to list ;w;');
				return;
			}
			
			let stream = fs.createWriteStream(path);
			
			for (let row of data) {
				let output = '\n\n\nMember ID - "' + row.ID + '" (this one is used to unban)\n';
				output += '\tUser nickname: ' + data[0].VICTIM_THAT_GOT_BANNED + '\n';
				output += '\tUser username: ' + data[0].BANNED_USERNAME + '\n';
				output += '\tModerator nickname: ' + data[0].ADMIN_NAME + '\n';
				output += '\tModerator username: ' + data[0].ADMIN_NAME_REAL + '\n';
				output += '\tDate of ban: ' + moment.unix(data[0].STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - data[0].STAMP) * 1000) + ' ago)' + '\n';
				
				stream.write(output);
			}
			
			stream.end();
			
			stream.on('finish', function() {
				msg.reply('List: ' + upath);
			});
		})
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
		
		if (!args[0])
			return DBot.CommandError('Argument is required', 'deoff', args, 1);
		
		if (typeof args[0] == 'object') {
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
				
				Postgres.query('DELETE FROM off_users WHERE "ID" =' + sql.Member(member) + ' AND "CHANNEL" = ' + msg.channel.uid);
			}
			
			return output;
		} else if (args[0].toLowerCase() == 'all') {
			let hit = false;
			let output = 'Will stop removing all new messages from: ';
			
			let stream;
			let sha = DBot.HashString(CurTime() + '___' + msg.channel.guild.id + msg.channel.id);
			let path = DBot.WebRoot + '/blogs/' + sha + '.txt';
			let upath = DBot.URLRoot + '/blogs/' + sha + '.txt';
			
			for (let member of msg.channel.guild.members.array()) {
				let hitLoop = false;
				
				for (let I in member.offs) {
					if (member.offs[I] == msg.channel.uid) {
						member.offs.splice(I, 1);
						hitLoop = true;
						break;
					}
				}
				
				if (!hitLoop)
					continue;
				
				if (!stream)
					stream = fs.createWriteStream(path);
				
				stream.write('<@' + member.user.id + '>     ' + Util.AppendSpaces(member.nickname || member.user.username, 60) + ' (' + member.user.username + ')\n');
				
				hit = true;
				Postgres.query('DELETE FROM off_users WHERE "ID" =' + sql.Member(member) + ' AND "CHANNEL" = ' + msg.channel.uid);
				
				output += '<@' + member.id + '> ';
			}
			
			if (!hit)
				return 'No users to deoff';
			
			stream.end();
			
			return 'Unmuted list: ' + upath;
		} else {
			return DBot.CommandError('Argument must be `all` or array of users', 'deoff', args, 1);
		}
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
	
	let member = msg.member;
	
	if (member.offs.includes(msg.channel.uid)) {
		let me = msg.channel.guild.member(DBot.bot.user);
		
		if (!me)
			return;
		
		if (!me.hasPermission('MANAGE_MESSAGES'))
			return;
		
		let identify = DBot.IdentifyCommand(msg);
		
		if ((identify == 'off' || identify == 'deoff') && member.hasPermission('MANAGE_MESSAGES'))
			return;
		
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('You are muted in this channel by moderator');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		msg.delete();
		return true;
	}
});

let userBanHit = function(member, row) {
	let output = 'You are softbanned on `' + member.guild.name + '`! ;n;\n';
	
	output += 'Moderator nickname: ' + data[0].ADMIN_NAME + '\n';
	output += 'Moderator username: ' + data[0].ADMIN_NAME_REAL + '\n';
	output += 'Date of ban: ' + moment.unix(data[0].STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - data[0].STAMP) * 1000) + ' ago)' + '\n';
	
	output += 'I am little Horsey, and i only do what admins tell me ;n;'
	
	if (!member.user.bot)
		member.sendMessage(output);
	
	setTimeout(function() {
		member.kick();
	}, 5000);
}

hook.Add('MemberInitialized', 'ModerationCommands', function(member) {
	if (!INIT)
		return;
	
	member.offs = [];
	
	Postgres.query('SELECT "CHANNEL" FROM off_users WHERE off_users."ID" = ' + member.uid, function(err, data) {
		for (let row of data) {
			member.offs.push(row.CHANNEL);
		}
	});
	
	Postgres.query('SELECT member_softban."STAMP", member_softban."ADMIN", member_names."NAME" AS "ADMIN_NAME", user_names."USERNAME" AS "ADMIN_NAME_REAL" FROM member_softban, member_names, member_id, user_names WHERE member_softban."ID" = ' + sql.Member(member) + ' AND member_names."ID" = member_softban."ADMIN" AND member_id."ID" = member_names."ID" AND user_names."ID" = member_id."USER"', function(err, data) {
		if (err) throw err;
		
		if (!data[0])
			return;
		
		userBanHit(member, data[0]);
	});
});

hook.Add('MembersInitialized', 'ModerationCommands', function() {
	let memberMap = [];
	let validMap = [];
	
	for (let member of DBot.GetMembers()) {
		memberMap[member.uid] = member;
		
		if (member.uid)
			validMap.push(member.uid);
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
	
	Postgres.query('SELECT member_softban."ID", member_softban."STAMP", member_softban."ADMIN", member_names."NAME" AS "ADMIN_NAME", user_names."USERNAME" AS "ADMIN_NAME_REAL" FROM member_softban, member_names, member_id, user_names WHERE member_softban."ID" = ANY(' + sql.Array(validMap) + '::INTEGER[]) AND member_names."ID" = member_softban."ADMIN" AND member_id."ID" = member_names."ID" AND user_names."ID" = member_id."USER"', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			let member = memberMap[row.ID];
			
			if (!member)
				continue;
			
			userBanHit(member, row);
		}
	});
});
