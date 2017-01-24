
module.exports = {
	name: 'avatar',
	
	help_args: '<user1> ...',
	desc: 'Prints user(s) avatar(s) URL(s)',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Nu user argument ;w;';
		
		let build = '';
		
		for (let user of args) {
			if (typeof(user) != 'object')
				return 'Invalid user argument. Use @User';
			
			build += '\n<@' + user.id + '>\'s Avatar: ' + (user.avatarURL || 'User have no avatar');
		}
		
		return build;
	}
}
