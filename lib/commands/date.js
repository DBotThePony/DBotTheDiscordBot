
module.exports = {
	name: 'date',
	alias: ['time'],
	
	help_args: '',
	desc: 'Displays my current time',
	
	func: function(args, cmd, rawcmd, msg) {
		return 'My current time is: ' + (new Date()).toString() + '\nNote: I am saying hours in 24h format.';
	}
}
