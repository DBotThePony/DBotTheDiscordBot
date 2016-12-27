
module.exports = {
	name: 'setname',
	alias: ['setnick', 'setnickname'],
	
	help_args: '<new name>',
	desc: 'Sets bot nickname on current server. You must have MANAGE_NICKNAMES or MANAGE_GUILD rights to do that',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'It is PM ;n;';
		
		if (!(msg.member.hasPermission('MANAGE_NICKNAMES') || msg.member.hasPermission('MANAGE_GUILD')) && msg.author.id != DBot.DBot)
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
