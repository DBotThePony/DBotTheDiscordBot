
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
	name: 'rtd',
	alias: ['roll'],
	
	help_args: '[amount of edges] [times]',
	desc: 'Rolls the dice!',
	
	func: function(args, cmd, msg) {
		let edges = Math.floor(Number.from(args[0]) || 6);
		let times = Math.floor(Number.from(args[1]) || 1);
		
		if (edges <= 1)
			return 'One edge? wot';
		
		if (edges > 100)
			edges = 100;
		
		if (times <= 0)
			return 'How can i throw it 0 times? 6.9';
		
		if (times > 10)
			times = 10;
		
		let rolls = [];
		
		for (let i = 1; i <= times; i++) {
			rolls.push(Math.Random(1, edges));
		}
		
		if (!DBot.IsPM(msg))
			msg.channel.sendMessage(msg.author + ' rolled: ' + rolls.join(', '));
		else
			msg.channel.sendMessage('Rolled: ' + rolls.join(', '));
	}
}
