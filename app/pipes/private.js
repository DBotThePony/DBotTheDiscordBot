
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

module.exports = {
	name: 'private',
	alias: ['p', 'pm'],
	
	help_args: '',
	desc: 'Outputs function into your PM',
	no_touch: true,
	
	func: function(args, cmd, msg) {
		msg.author.sendMessage(cmd);
		return true;
	}
};
