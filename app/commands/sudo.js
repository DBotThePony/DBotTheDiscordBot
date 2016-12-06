
module.exports = {
	name: 'sudo',
	
	help_args: '<command> <arguments>',
	desc: 'Runs super sicret commands as superpony (ponyroot)',
	
	help_hide: true,
	
	func: function(args, cmd, msg) {
		return 'sudo: You are not a Lauren Faust!';
	}
}
