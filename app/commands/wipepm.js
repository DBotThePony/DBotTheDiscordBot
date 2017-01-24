
module.exports = {
	name: 'wipepm',
	
	help_args: '',
	desc: 'Wipes some of old messages written by me in your PM',
	
	func: function(args, cmd, msg) {
		if (!DBot.IsPM(msg))
			return 'Must execute in PM channel ;n;';
		
		let conf = new DBot.Confirm(msg.author, msg.channel);
		
		conf.setTitle('Wipe of PM messages');
		conf.setDesc('');
		
		conf.confirm(function() {
			msg.channel.fetchMessages({limit: 100})
			.then(function(messages) {
				let arr = messages.array();
				
				for (let i in arr) {
					if (arr[i].author.id == DBot.bot.user.id) {
						arr[i].delete(0);
					}
				}
			});
		});
		
		conf.decline(function() {
			msg.reply('Aborting');
		});
		
		conf.echo();
	},
}
