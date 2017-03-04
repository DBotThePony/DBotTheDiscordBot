
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const text = `:joy: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :joy: :joy: :joy: 
:joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :joy: :joy: :joy: :joy: 
:joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :rage: :joy: :joy: :joy: :joy: 
:joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: 
:joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :rage: :rage: :rage: :rage: :rage: :joy: :joy: 
:joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :rage: :rage: :rage: :joy: :rage: :rage: :rage: :joy: 
:joy: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :rage: :rage: :joy: :joy: :joy: :rage: :rage: :rage: 
:rage: :rage: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :rage: :rage:
:rage: :rage: :rage: :joy: :joy: :joy: :rage: :rage: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :joy: 
:joy: :rage: :rage: :rage: :joy: :rage: :rage: :rage: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: 
:joy: :joy: :rage: :rage: :rage: :rage: :rage: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: 
:joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: 
:joy: :joy: :joy: :joy: :rage: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: 
:joy: :joy: :joy: :joy: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: 
:joy: :joy: :joy: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :joy: 
:joy: :joy: :joy: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :joy::joy:
:joy: :joy: :joy: :joy: :joy: :joy: :joy: :rage: :rage: :joy: :joy: :joy: :joy: :joy: :joy: :joy: :joy:`;

module.exports = {
	name: 'windmill',
	
	help_args: '',
	desc: 'Windmill',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		return text;
	}
};
