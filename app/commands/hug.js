
let defAction = function(name, text) {
	return function(args, cmd, msg) {
		let actor;
		let target;
		
		if (!args[0]) {
			actor = DBot.bot.client;
			target = msg.author;
		} else if (typeof args[0] == 'object') {
			actor = msg.author;
			target = args[0];
		} else {
			return DBot.CommandError('Oh?', 'hug', args, 1);
		}
		
		msg.sendMessage('<@' + actor.id + '> *' + text + '* <@' + target.id + '>');
	}
}

module.exports = {
	name: 'hug',
	
	help_args: '[user]',
	desc: 'Hugs? ^w^',
	allowUserArgument: true,
	
	func: defAction('hug', 'hugs'),
}

DBot.RegisterCommand({
	name: 'slap',
	
	help_args: '[user]',
	desc: 'Slaps',
	allowUserArgument: true,
	
	func: defAction('slap', 'softly slaps'),
});

DBot.RegisterCommand({
	name: 'shitbot',
	
	help_args: '',
	desc: '',
	allowUserArgument: true,
	help_hide: true,
	
	func: function() {
		return 'You aren\'t better';
	},
});

DBot.RegisterCommand({
	name: 'shit',
	
	help_args: '',
	desc: '',
	allowUserArgument: true,
	help_hide: true,
	
	func: function() {
		if (!args[0])
			return 'What';
		else if (args[0] == 'bot')
			return 'fuck you';
		else
			return 'i don\'t care';
	},
});

DBot.RegisterCommand({
	name: 'cock',
	alias: ['fuck', 'dick'],
	
	help_args: '',
	desc: 'rood',
	allowUserArgument: true,
	help_hide: true,
	
	func: function() {
		if (args[0] == 'you')
			return 'fuck you too~';
		
		msg.sendMessage('Rood');
	}
});