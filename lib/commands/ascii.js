
var figlet = require('figlet');

module.exports = {
	name: 'ascii',
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase> ...',
	desc: 'Turn chars into ASCII art',
	
	func: function(args, cmd, rawcmd, msg) {
		if (cmd.length > 10 && !DBot.IsPM(msg))
			return 'Too big!';
		
		if (cmd.length > 30)
			return 'Too big!';
		
		figlet(cmd, function(err, data) {
			if (err)
				return;
			
			msg.reply('```' + data + '```');
		});
	},
}