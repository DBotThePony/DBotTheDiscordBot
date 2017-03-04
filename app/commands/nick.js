
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
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'It is PM ;n;';
		
		if (typeof args[0] != 'object')
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
	},
}
