
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

module.exports = {
	name: 'date',
	alias: ['time'],
	
	help_args: '',
	desc: 'Displays my current time',
	
	func: function(args, cmd, msg) {
		return 'My current time is: ' + (new Date()).toString() + '\nNote: I am saying hours in 24h format.';
	}
}
