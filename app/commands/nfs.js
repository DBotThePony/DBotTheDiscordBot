
const fs = DBot.fs;

module.exports = {
	name: 'nfs',
	alias: ['needforsleep'],
	
	help_args: '',
	desc: 'Need For Sleep',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		fs.readFile('./resource/files/nfs.png', {encoding: null}, function(err, data) {
			if (!data)
				return;
			
			if (msg.wasDeleted)
				return;
			
			msg.channel.sendFile(data, 'yn.jpg').then(function(msg2) {
				if (msg.wasDeleted)
					msg2.delete(0);
				else {
					msg.replies = msg.replies || [];
					msg.replies.push(msg2);
				}
			});
		});
	}
}
