
module.exports = {
	name: 'sudo',
	
	help_args: '<command> <arguments>',
	desc: 'Runs super sicret commands as superpony (ponyroot)',
	
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (msg.author.id == DBot.DBot)
			return 'sudo ' + cmd + '...';
		else
			return '42';
	}
}
