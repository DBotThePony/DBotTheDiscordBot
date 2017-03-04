
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

/* global MathHelper, Postgres, DBot */

// https://dbot.serealia.ca/info/

module.exports = {
	name: 'infometer',
	alias: ['infometr', 'dmetr', 'info'],
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase>',
	desc: 'How much proven info is?',
	
	func: function(args, cmd, msg) {
		Postgres.query('SELECT "VALUE" FROM infometr WHERE "PHRASE" = ' + Postgres.escape(cmd.toLowerCase()), function(err, data) {
			if (data && data[0]) {
				msg.reply('\n```' + cmd + '\nInfo - ' + data[0].VALUE + '%```');
			} else {
				let length = cmd.length;
				let min = 0;
				let finalPercent = 0;
				
				let Jackpot = MathHelper.Random(0, 25);
				
				if (Jackpot === 5) {
					finalPercent = MathHelper.Random(75, 100);
				} else if (Jackpot === 2) {
					finalPercent = MathHelper.Random(50, 75);
				} else if (Jackpot === 8) {
					finalPercent = MathHelper.Random(30, 66);
				} else if (Jackpot === 10) {
					finalPercent = MathHelper.Random(70, 80);
				} else if (Jackpot === 15) {
					finalPercent = MathHelper.Random(75, 100);
				} else if (Jackpot === 18) {
					finalPercent = MathHelper.Random(10, 40);
				} else if (Jackpot === 25) {
					finalPercent = 100;
				} else if (Jackpot === 18) {
					finalPercent = 0;
				} else if (Jackpot === 20) {
					finalPercent = MathHelper.Random(40, 80);
				} else if (length > 50) {
					finalPercent = MathHelper.Random(10, 100);
					
					if (MathHelper.Random(0, 10) === 7)
						finalPercent = 100;
				} else if (length > 30) {
					finalPercent = MathHelper.Random(0, 100);
					
					if (MathHelper.Random(0, 15) === 5)
						finalPercent = 75;
					
					if (MathHelper.Random(0, 15) === 7)
						finalPercent = 95;
				} else if (length > 10) {
					finalPercent = MathHelper.Random(20, 100);
					
					if (MathHelper.Random(0, 7) === 2)
						finalPercent = 75;
					
					if (MathHelper.Random(0, 5) === 0)
						finalPercent = 100;
				} else {
					finalPercent = MathHelper.Random(0, 100);
					
					if (MathHelper.Random(0, 5) === 0)
						finalPercent = 100;
				}
				
				msg.reply('\n```' + cmd + '\nInfo - ' + finalPercent + '%```');
				
				Postgres.query('INSERT INTO infometr ("PHRASE", "VALUE") VALUES (' + Postgres.escape(cmd.toLowerCase()) + ', \'' + finalPercent + '\')');
			}
		});
		
		return true;
	}
};

DBot.RegisterPipe(module.exports);
