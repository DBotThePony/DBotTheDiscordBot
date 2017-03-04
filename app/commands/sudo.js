
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
	name: 'sudo',
	
	help_args: '<command> <arguments>',
	desc: 'Runs super sicret commands as superpony (ponyroot)',
	
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (DBot.owners.includes(msg.author.id))
			return 'sudo ' + cmd + '...';
		else
			return '42';
	}
}
