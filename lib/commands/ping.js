
module.exports = {
	name: 'ping',
	
	help_args: '',
	desc: 'Prints how much time it takes to post a message for me',
	
	func: function(args, cmd, rawcmd, msg) {
		var stamp = CurTime();
		
		msg.channel.sendMessage('Bleh')
		.then(function(nmsg) {
			var newTime = CurTime();
			var delta = newTime - stamp;
			
			nmsg.edit('It takes me ' + Math.floor(delta * 1000) + ' milliseconds to post a message!');
		});
	},
}