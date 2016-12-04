
module.exports = {
	name: 'test',
	
	help_hide: true,
	
	help_args: '',
	desc: 'Test command',
	
	func: function(args, cmd, msg) {
		return 'It seems working as you espected?';
	}
}
