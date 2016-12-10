
module.exports = {
	name: 'private',
	alias: ['p', 'pm'],
	
	help_args: '',
	desc: 'Outputs function into your PM',
	no_touch: true,
	
	func: function(args, cmd, msg) {
		msg.author.sendMessage(cmd);
		return true;
	},
};
