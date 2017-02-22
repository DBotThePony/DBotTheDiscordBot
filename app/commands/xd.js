
/* global DBot */

module.exports = {
	name: 'xd',
	
	help_args: '<phrase>',
	desc: 'XD',
	
	func: function(args, cmd, msg) {
		if (args.length > 3)
			return 'Max 3 arguments';
		else {
			if (args[0] === undefined)
				return DBot.CommandError('You need at least one argument', 'xd', args, 1);
			
			if (args[1] === undefined)
				args[1] = args[0];
			
			if (args[2] === undefined)
				args[2] = args[1];
		}
		
		for (const i in args) {
			const arg = args[i];
			if (arg.length > 10)
				return DBot.CommandError('Argument is too long', 'xd', args, i + 1);
		}
		
		let middleSpaces = 11;
		let preMiddleSpaces = 7;
		
		if (args[0].length === 1) {
			preMiddleSpaces = 6;
			middleSpaces = 10;
		} else if (args[0].length === 2) {
			middleSpaces = 11 - (3 - args[0].length);
		} else if (args[0].length > 3) {
			preMiddleSpaces += Math.floor((args[0].length - 3) / 3) + 1;
			middleSpaces += Math.floor((args[0].length - 3) / 3 + .5);
		}
		
		let build = `${args[0]}           ${args[0]}    ${args[1]} ${args[2]}
  ${args[0]}       ${args[0]}      ${args[1]}    ${args[2]}
    ${args[0]}   ${args[0]}        ${args[1]}     ${args[2]}
${String.spaces(preMiddleSpaces)}${args[0]}${String.spaces(middleSpaces)}${args[1]}     ${args[2]}
    ${args[0]}   ${args[0]}        ${args[1]}     ${args[2]}
  ${args[0]}       ${args[0]}      ${args[1]}   ${args[2]}
${args[0]}           ${args[0]}    ${args[1]} ${args[2]}`;
		
		return '```\n' + build + '\n```';
	}
};
