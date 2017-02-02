
module.exports = {
	name: 'eval',
	alias: ['debug'],
	
	help_args: '<code>',
	desc: 'Bot owner only',
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (!DBot.owners.includes(msg.author.id))
			return 'Not a bot owner';
		
		let myValue;
		
		try {
			myValue = eval(cmd);
		} catch(err) {
			msg.sendMessage('```\n' + err.stack + '\n```');
			return;
		}
		
		if (myValue === undefined) {
			msg.sendMessage('```undefined```');
		} else if (myValue === null) {
			msg.sendMessage('```null```');
		} else {
			msg.sendMessage('```\n' + myValue.toString() + '\n```');
		}
	}
};
