
// https://dbot.serealia.ca/info/

var utf8 = require('utf8');

DBot.DefineMySQLTable('infometr', '`ID` INTEGER NOT NULL AUTO_INCREMENT, `PHRASE` VARCHAR(255) NOT NULL, `VALUE` INTEGER NOT NULL, PRIMARY KEY (`ID`)');

module.exports = {
	name: 'infometer',
	alias: ['infometr', 'dmetr', 'info'],
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase>',
	desc: 'How much proven info is?',
	
	func: function(args, cmd, msg) {
		MySQL.query('SELECT `VALUE` FROM `infometr` WHERE `PHRASE` = ' + MySQL.escape(utf8.encode(cmd.toLowerCase())), function(err, data) {
			if (data && data[0]) {
				msg.reply('\n```' + cmd + '\nInfo - ' + data[0].VALUE + '%```');
			} else {
				var length = cmd.length;
				var min = 0;
				var finalPercent = 0;
				
				var Jackpot = Util.Random(0, 25);
				
				if (Jackpot == 5) {
					finalPercent = Util.Random(75, 100);
				} else if (Jackpot == 2) {
					finalPercent = Util.Random(50, 75);
				} else if (Jackpot == 8) {
					finalPercent = Util.Random(30, 66);
				} else if (Jackpot == 10) {
					finalPercent = Util.Random(70, 80);
				} else if (Jackpot == 15) {
					finalPercent = Util.Random(75, 100);
				} else if (Jackpot == 18) {
					finalPercent = Util.Random(10, 40);
				} else if (Jackpot == 25) {
					finalPercent = 100;
				} else if (Jackpot == 18) {
					finalPercent = 0;
				} else if (Jackpot == 20) {
					finalPercent = Util.Random(40, 80);
				} else if (length > 50) {
					finalPercent = Util.Random(10, 100);
					
					if (Util.Random(0, 10) == 7)
						finalPercent = 100;
				} else if (length > 30) {
					finalPercent = Util.Random(0, 100);
					
					if (Util.Random(0, 15) == 5)
						finalPercent = 75;
					
					if (Util.Random(0, 15) == 7)
						finalPercent = 95;
				} else if (length > 10) {
					finalPercent = Util.Random(20, 100);
					
					if (Util.Random(0, 7) == 2)
						finalPercent = 75;
					
					if (Util.Random(0, 5) == 0)
						finalPercent = 100;
				} else {
					finalPercent = Util.Random(0, 100);
					
					if (Util.Random(0, 5) == 0)
						finalPercent = 100;
				}
				
				msg.reply('\n```' + cmd + '\nInfo - ' + finalPercent + '%```');
				
				MySQL.query('INSERT INTO `infometr` (`PHRASE`, `VALUE`) VALUES (' + MySQL.escape(utf8.encode(cmd.toLowerCase())) + ', "' + finalPercent + '")');
			}
		});
	},
}