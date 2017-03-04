
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;
const CommandHelper = myGlobals.CommandHelper;

const text = '```\n\
About:\n\
NotDBot was created by DBot at 17 November 2016 as an experiment by DBot\n\
Thanks for everyone who likes the bot, everyone who giving an ideas and tracking\n\
bot issues. It makes me (DBot) feel good at this point, when i see that\n\
my stuff is making everyone else happy. To invite bot use }invite, use }help for gettign help\n\
You can change bot prefix using commands }svar and }cvar\n\
Bot (main) issues tracker is located there: https://git.dbot.serealia.ca/dbot/NotDBot/issues\n\
\n\
Much thanks to all of you. By Konstantin "DBot" Linev.';

module.exports = {
	name: 'about',
	
	help_args: '',
	desc: 'About',
	
	func: function(args, cmd, msg) {
		return text;
	}
};
