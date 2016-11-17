
var cowsay = require('cowsay');

module.exports = {
	name: 'cowsay',
	alias: ['cow'],
	
	argNeeded: true,
	failMessage: 'Missing phrase',
	
	help_args: '<phrase> ...',
	desc: 'Mooo',
	
	func: function(args, cmd, rawcmd, msg) {
		var result = cowsay.say({
			text: cmd,
		});
		
		return '```' + result + '```';
	},
}

var anotherCows = [
	'tux',
	'sheep',
	'www',
	'dragon',
	'vader',
];

anotherCows.forEach(function(item) {
	DBot.RegisterCommand({
		id: item + 'say',
		name: item + 'say',
		alias: [item],
		
		argNeeded: true,
		failMessage: 'Missing phrase',
		
		help_args: '<phrase> ...',
		desc: 'Say teh word',
		
		func: function(args, cmd, rawcmd, msg) {
			var result = cowsay.say({
				text: cmd,
				f: item,
			});
			
			return '```' + result + '```';
		},
	});
});
