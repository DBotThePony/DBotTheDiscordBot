
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

module.exports = {
	name: 'owner',
	
	help_args: '',
	desc: 'Prints owner of this server',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;'
		
		return 'Owner of this server is: <@' + msg.channel.guild.ownerID + '>';
	}
}
