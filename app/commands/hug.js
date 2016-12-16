
module.exports = {
	name: 'hug',
	
	help_args: '',
	desc: 'Wanna hugs? ^w^',
	allowUserArgument: true,
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (DBot.DBot == msg.author.id) {
			if (typeof args[0] == 'object') {
				return '* hugs <@' + args[0].id + '> *';
			} else {
				return '* hugs <@' + msg.author.id + '> *';
			}
		} else {
			return '* hugs <@' + msg.author.id + '> *';
		}
	}
}
