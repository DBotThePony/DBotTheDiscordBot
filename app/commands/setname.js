
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
	name: 'setname',
	alias: ['setnick', 'setnickname'],
	
	help_args: '<new name>',
	desc: 'Sets bot nickname on current server. You must have MANAGE_NICKNAMES or MANAGE_GUILD rights to do that',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'It is PM ;n;';
		
		if (!(msg.member.hasPermission('MANAGE_NICKNAMES') || msg.member.hasPermission('MANAGE_GUILD')) && !DBot.owners.includes(msg.author.id))
			return 'Nope.avi';
		
		let me = msg.channel.guild.member(DBot.bot.user);
		if (!me.hasPermission('CHANGE_NICKNAME'))
			return 'I dunt have `CHANGE_NICKNAME` permission ;n;';
		
		if (!args[0])
			return 'Nu name ;n;';
		
		me.setNickname(cmd);
		
		return 'Done';
	},
}
