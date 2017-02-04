
/* global DBot, Postgres */


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
		let split = msg.content.split(' ');
		split.splice(0, 1);
		
		try {
			myValue = eval(split.join(' '));
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

DBot.RegisterCommand({
	name: 'sql',
	
	help_args: '<code>',
	desc: 'Bot owner only',
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (!DBot.owners.includes(msg.author.id))
			return 'Not a bot owner';
		
		msg.channel.startTyping();
		
		let split = msg.content.split(' ');
		split.splice(0, 1);
		
		Postgres.query(split.join(' '), function(err, data) {
			msg.channel.stopTyping();
			
			if (err) {
				msg.reply('```\n' + err.stack + '\n```');
				return;
			}
			
			let output = '```\n';
			
			for (let row of data) {
				let mid = [];
				
				for (let i in row) {
					mid.push(row[i]);
				}
				
				output += '[' +  mid.join(', ') + ']\n';
			}
			
			msg.reply(output + '```');
		});
	}
});
