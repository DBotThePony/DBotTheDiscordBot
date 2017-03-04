
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
	name: 'leave',
	
	help_args: '',
	desc: 'Leaves current server.',
	
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (DBot.owners.includes(msg.author.id))
			if (msg.channel.guild)
				msg.channel.guild.leave();
			else
				return 'Not on a server?';
		else
			return 'Bot owner only';
	}
}
