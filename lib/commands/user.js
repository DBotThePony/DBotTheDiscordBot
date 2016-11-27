
module.exports = {
	name: 'user',
	
	argNeeded: true,
	failMessage: 'Missing user',
	allowUserArgument: true,
	
	help_args: '<user>',
	desc: 'Prints information about user',
	
	func: function(args, cmd, rawcmd, msg) {
		if (typeof(args[0]) != 'object') {
			return 'Must be a valid user ;n;' + Util.HighlightHelp(['user'], 2, args);
		}
		
		var output = '\n```';
		
		output += 'User ID:          ' + args[0].id + '\n';
		output += 'User Avatar:      ' + (args[0].avatarURL || '<no avatar>') + '\n';
		output += 'User Avatar ID:   ' + (args[0].avatar || '<no avatar>') + '\n';
		output += 'User Name:        ' + args[0].username + '\n';
		output += 'Is a bot?:        ' + (args[0].bot && 'yes' || 'no') + '\n';
		
		return output + '```';
	},
}
