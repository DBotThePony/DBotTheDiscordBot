
module.exports = {
	name: 'hug',
	
	help_args: '',
	desc: 'Wanna hugs? ^w^',
	allowUserArgument: true,
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (DBot.DBot == msg.author.id) {
			if (typeof args[0] == 'object') {
				msg.channel.sendMessage('*hugs* <@' + args[0].id + '>');
			} else {
				msg.channel.sendMessage('*hugs* <@' + msg.author.id + '>');
			}
		} else {
			msg.channel.sendMessage('*hugs* <@' + msg.author.id + '>');
		}
	}
}
