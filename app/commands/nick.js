
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

module.exports = {
	name: 'nick',
	alias: ['nickname', 'username'],
	
	help_args: '<@user> [New name]',
	desc: 'Prints user\'s name. If new name is supplied, changes nickname',
	allowUserArgument: true,
	nopm: true,
	
	func: function(args, cmd, msg) {
		if (typeof args[0] !== 'object')
			return DBot.CommandError('Invalid user', 'nick', args, 1);
		
		let member = msg.channel.guild.member(args[0]);
		
		if (!member)
			return DBot.CommandError('Invalid user', 'nick', args, 1);
		
		if (args[1] === undefined) {
			msg.reply('Username: `' + args[0].username + '`, ' + (member.nickname && ('nickname: `' + member.nickname + '`') || 'he has no nickname on the server'));
		} else {
			if (!(msg.member.hasPermission('MANAGE_NICKNAMES') || msg.member.hasPermission('MANAGE_GUILD')) && !DBot.owners.includes(msg.author.id))
				return 'Nope.avi';
			
			let me = msg.channel.guild.member(DBot.bot.user);
			if (!me.hasPermission('MANAGE_NICKNAMES'))
				return 'I dunt have `MANAGE_NICKNAMES` permission ;n;';
			
			if (!DBot.CanTarget(me, member))
				return 'Can\'t target that ;n;';
			
			if (!DBot.CanTarget(msg.member, member))
				return 'In Soviet Russia, target of command targets you.';
			
			let build = '';
			
			for (let i = 1; i < args.length; i++) {
				build += ' ' + args[i];
			}
			
			member.setNickname(build.substr(1))
			.then(function() {
				msg.reply('Done');
			})
			.catch(function() {
				msg.reply('Something went wrong x.x');
			});
		}
	}
};

const iReplace = new RegExp('%i%', 'gi');

DBot.RegisterCommand({
	name: 'mnick',
	alias: ['mnickname', 'massnickname', 'massnick'],
	
	help_args: '<@user/selectionid> <New name>',
	desc: 'Changes all specified users nickname to THE LAST "GIVEN ARGUMENT IN QUOTES"',
	allowUserArgument: true,
	selections: true,
	nopm: true,
	
	func: function(args, cmd, msg) {
		if (!(msg.member.hasPermission('MANAGE_NICKNAMES') || msg.member.hasPermission('MANAGE_GUILD')) && !DBot.owners.includes(msg.author.id))
			return 'Nope.avi';
		
		const me = msg.channel.guild.member(DBot.bot.user);
		if (!me.hasPermission('MANAGE_NICKNAMES'))
			return 'I dunt have `MANAGE_NICKNAMES` permission ;n;';
		
		const isAdmin = me.hasPermission('ADMINISTRATOR');
		
		if (!args[0])
			return DBot.CommandError('At least two arguments is required', 'mnick', args, 1);
		
		if (!args[1])
			return DBot.CommandError('At least two arguments is required', 'mnick', args, 2);
		
		const lastArg = args[args.length - 1];
		
		if (typeof lastArg !== 'string')
			return DBot.CommandError('Last argument must be a string', 'mnick', args, args.length);
		
		let total = 0;
		
		const valids = [];
		
		for (let i = 0; i < args.length - 1; i++) {
			const user = args[i];
			
			if (typeof user !== 'object')
				return DBot.CommandError('Invalid member', 'mnick', args, Number(i) + 1);
			
			const member = msg.channel.guild.member(user);
			
			if (typeof member !== 'object')
				return DBot.CommandError('Invalid member', 'mnick', args, Number(i) + 1);
			
			if (!DBot.CanTarget(me, member))
				return DBot.CommandError('Can\'t target that ;n;', 'mnick', args, Number(i) + 1);

			if (!DBot.CanTarget(msg.member, member))
				return DBot.CommandError('In Soviet Russia, target of command targets you.', 'mnick', args, Number(i) + 1);
			
			valids.push(member);
		}
		
		msg.channel.startTyping();
		
		for (const i in valids) {
			const member = valids[i];
			const finalNickname = lastArg.replace(iReplace, Number(i) + 1);
			total++;
			
			member.setNickname(finalNickname)
			.then(() => {
				total--;
		
				if (total === 0) {
					msg.channel.stopTyping();
					msg.reply('Done:tm:');
				}
			}).catch(() => {
				total--;
				
				if (total === 0) {
					msg.channel.stopTyping();
					msg.reply('Done:tm:');
				}
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'unmnick',
	alias: ['unmnickname', 'unmassnickname', 'unmassnick', 'unnick'],
	
	help_args: '<@user/selectionid>',
	desc: 'Removes nicknames from targets',
	allowUserArgument: true,
	selections: true,
	nopm: true,
	
	func: function(args, cmd, msg) {
		if (!(msg.member.hasPermission('MANAGE_NICKNAMES') || msg.member.hasPermission('MANAGE_GUILD')) && !DBot.owners.includes(msg.author.id))
			return 'Nope.avi';
		
		const me = msg.channel.guild.member(DBot.bot.user);
		if (!me.hasPermission('MANAGE_NICKNAMES'))
			return 'I dunt have `MANAGE_NICKNAMES` permission ;n;';
		
		if (!args[0])
			return DBot.CommandError('At least one argument is required', 'mnick', args, 1);
		
		let total = 0;
		
		msg.channel.startTyping();
		
		for (let i = 0; i < args.length - 1; i++) {
			let member = args[i];
			
			if (typeof member !== 'object') {
				msg.channel.stopTyping();
				return DBot.CommandError('Invalid member', 'mnick', args, Number(i) + 1);
			}
			
			if (!DBot.CanTarget(me, member)) {
				msg.channel.stopTyping();
				return DBot.CommandError('Can\'t target that ;n;', 'mnick', args, Number(i) + 1);
			}

			if (!DBot.CanTarget(msg.member, member)) {
				msg.channel.stopTyping();
				return DBot.CommandError('In Soviet Russia, target of command targets you.', 'mnick', args, Number(i) + 1);
			}

			total++;
			
			member.setNickname('')
			.then(() => {
				total--;
		
				if (total === 0) {
					msg.channel.stopTyping();
					msg.reply('Done:tm:');
				}
			}).catch(() => {
				total--;
				
				if (total === 0) {
					msg.channel.stopTyping();
					msg.reply('Done:tm:');
				}
			});
		}
	}
});
