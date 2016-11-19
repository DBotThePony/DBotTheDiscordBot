
module.exports = {
	name: 'avatar',
	
	help_args: '<user1> ...',
	desc: 'Prints user(s) avatar(s) URL(s)',
	allowUserArgument: true,
	
	func: function(args, cmd, rawcmd, msg) {
		if (!args[0])
			return 'Nu user argument ;w;';
		
		var build = '';
		
		for (var i in args) {
			var user = args[i];
			
			if (typeof(user) != 'object')
				return 'Invalid user argument. Use @User';
			
			build += '\n<@' + user.id + '>\'s Avatar: ' + (user.avatarURL || 'User have no avatar');
		}
		
		return build;
	}
}
