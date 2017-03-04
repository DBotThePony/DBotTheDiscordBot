
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
	name: 'more',
	
	help_hide: false,
	desc: 'Retries previous **search related** command',
	delay: -0.1,
	
	func: function(args, cmd, msg) {
		let cid = msg.channel.id;
		let uid = msg.author.id;
		if (!DBot.__LastMoreCommand[cid])
			DBot.__LastMoreCommand[cid] = {};
		
		if (!DBot.__LastMoreCommand[cid][uid])
			return 'There was no search command before! ;n;';
		
		let data = DBot.__LastMoreCommand[cid][uid];
		let cCommand = data[0];
		let parsedArgs = data[1];
		let rawcmd = data[2];
		let moreArgs = data[3];
		let parsedHandlers = data[4];
		
		DBot.ExecuteCommand(cCommand, msg, parsedArgs, rawcmd, cCommand.id, moreArgs || [], parsedHandlers);
	},
};

