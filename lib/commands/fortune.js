
const fs = require('fs');

let categories = [];
let totalCnt = 0;

fs.readdir('./resource/fortune', function(err, files) {
	categories = files;
	
	MySQL.query('CREATE TABLE IF NOT EXISTS `fortune` (`ID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, `CATEGORY` CHAR(16) NOT NULL, `CONTENT` TEXT NOT NULL)', function() {
		MySQL.query('SELECT COUNT(`ID`) as `COUNT` FROM `fortune` LIMIT 0, 1', function(err, data) {
			if (data && data[0]) {
				totalCnt = Number(data[0].COUNT);
				return;
			}
			
			// Fill the SQL table!
			// Using SQL for stuff that is stored in files because it is better in preformance
			// And of course - this consumes much less memory
			
			for (let file of categories) {
				fs.readFile('./resource/fortune/' + file, 'utf8', function(err, data) {
					if (err) {
						console.error(err);
						return;
					}
					
					let phrases = data.split('%');
					let esc = Util.escape(file);
					
					for (let phraseID in phrases) {
						let phr = phrases[phraseID];
						
						MySQL.query('INSERT INTO `fortune` (`CATEGORY`, `CONTENT`) VALUES (' + esc + ', ' + Util.escape(phr) + ')');
					}
				});
			}
		});
	});
});

module.exports = {
	name: 'fortune',
	
	help_args: '',
	desc: 'Messages from Cookies!',
	
	func: function(args, cmd, msg) {
		MySQL.query('SELECT `CONTENT` FROM `fortune` WHERE `ID` = ' + Util.Random(1, totalCnt), function(err, data) {
			if (err || !data || !data[0]) {
				return;
			}
			
			msg.reply('```' + data[0].CONTENT + '```');
		});
	},
}
