
module.exports = {
	name: 'setavatar',
	
	help_hide: true,
	help_args: 'Nope.avi',
	desc: 'Nope.avi',
	
	func: function(args, cmd, rawcmd, msg) {
		if (msg.author.id != DBot.DBot)
			return 'Nope.avi';
		
		if (!args[0])
			return 'Nu URL ;n;';
		
		DBot.LoadImageURL(args[0], function(newPath) {
			DBot.bot.user.setAvatar(newPath);
			msg.reply('Done');
		});
	},
}
