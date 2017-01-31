
module.exports = {
	name: 'sudo',
	
	help_args: '<command> <arguments>',
	desc: 'Runs super sicret commands as superpony (ponyroot)',
	
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (DBot.owners.includes(msg.author.id))
			return 'sudo ' + cmd + '...';
		else
			return '42';
	}
}
