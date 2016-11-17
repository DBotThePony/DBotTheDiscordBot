
module.exports = {
	name: 'reverse',
	alias: ['r'],
	
	argNeeded: true,
	failMessage: 'Missing phrase for reverse',
	
	help_args: '<phrase> ...',
	desc: 'Reverces a string',
	
	func: function(args, cmd, rawcmd, msg) {
		var out = '';
		
		for (i = cmd.length - 1; i >= 0; i--) {
			out += cmd[i];
		}
		
		return out;
	},
}

DBot.RegisterCommand({
	name: 'sreverse',
	alias: ['sr'],
	
	argNeeded: true,
	failMessage: 'Missing phrase for soft reverse',
	
	help_args: '<phrase> ...',
	desc: 'Reverces all phrases in command',
	
	func: function(args, cmd, rawcmd, msg) {
		var out = '';
		
		args.forEach(function(item) {
			for (i = item.length - 1; i >= 0; i--) {
				out += item[i];
			}
			
			out += ' ';
		});
		
		return out;
	},
});