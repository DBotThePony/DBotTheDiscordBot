
module.exports = {
	name: 'setavatar',
	
	help_hide: true,
	help_args: 'Nope.avi',
	desc: 'Nope.avi',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (msg.author.id != DBot.DBot)
			return 'Nope.avi';
		
		let url = DBot.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Nu URL ;n;', 'setavatar', args, 1);
		
		DBot.LoadImageURL(url, function(newPath) {
			DBot.bot.user.setAvatar(newPath);
			msg.reply('Done');
		});
	},
}
