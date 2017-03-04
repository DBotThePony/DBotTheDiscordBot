
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
	name: 'setavatar',
	
	help_hide: true,
	help_args: 'Nope.avi',
	desc: 'Nope.avi',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (!DBot.owners.includes(msg.author.id))
			return 'Nope.avi';
		
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Nu URL ;n;', 'setavatar', args, 1);
		
		DBot.LoadImageURL(url, function(newPath) {
			DBot.bot.user.setAvatar(newPath);
			msg.reply('Done');
		});
	},
}
