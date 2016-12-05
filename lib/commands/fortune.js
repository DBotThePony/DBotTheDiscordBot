
const fs = require('fs');

MySQL.query('CREATE TABLE IF NOT EXISTS `fortune` (`ID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, `CATEGORY` CHAR(16) NOT NULL, `CONTENT` TEXT NOT NULL)', function() {
	MySQL.query('SELECT `ID` FROM `fortune` LIMIT 0, 1', function(err, data) {
		if (data && data[0]) {
			return;
		}
		
		// Fill the SQL table!
		// Using SQL for stuff that is stored in files because it is better in preformance
		// And of course - this consumes much less memory
		
		fs.readdir('./resource/fortune', function(err, files) {
			for (let file in files) {
				fs.readFile('./resource/fortune/' + files[file], 'utf8', function(err, data) {
					if (err) {
						console.error(err);
						return;
					}
					
					let phrases = data.split('%');
					let esc = Util.escape(files[file]);
					
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
		msg.channel.startTyping();
		
		MySQL.query('SELECT `CONTENT` FROM `fortune` ORDER BY RAND() LIMIT 0, 1', function(err, data) {
			msg.channel.stopTyping();
			if (err || !data || !data[0]) {
				return;
			}
			
			msg.reply('```' + data[0].CONTENT + '```');
		});
	},
}
