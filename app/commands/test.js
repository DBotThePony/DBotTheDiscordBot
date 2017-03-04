
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
	name: 'test',
	
	help_hide: true,
	
	help_args: '',
	desc: 'Test command',
	
	func: function(args, cmd, msg) {
		return 'It seems working as you expected? ^з^';
	}
}
