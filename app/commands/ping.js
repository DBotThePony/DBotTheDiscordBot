
module.exports = {
	name: 'ping',
	
	help_args: '',
	desc: 'Prints how much time it takes to post a message for me',
	
	func: function(args, cmd, msg) {
		let stamp = CurTime();
		
		msg.sendMessage('Bleh')
		.then(function(nmsg) {
			let newTime = CurTime();
			let delta = newTime - stamp;
			
			nmsg.edit('It takes me ' + Math.floor(delta * 1000) + ' milliseconds to post a message!');
		});
	},
}