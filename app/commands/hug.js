
let defAction = function(name, text) {
	return function(args, cmd, msg) {
		let actor;
		let target;
		
		if (!args[0]) {
			actor = DBot.bot.user;
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
	name: 'poke',
	
	help_args: '[user]',
	desc: 'Pokes',
	allowUserArgument: true,
	
	func: defAction('poke', 'pokes'),
});

DBot.RegisterCommand({
	name: 'punch',
	
	help_args: '[user]',
	desc: 'Punches',
	allowUserArgument: true,
	
	func: defAction('punch', 'punches'),
});

DBot.RegisterCommand({
	name: 'squeeze',
	
	help_args: '[user]',
	desc: 'Squeezes',
	allowUserArgument: true,
	
	func: defAction('squeeze', 'hugs tight'),
});

DBot.RegisterCommand({
	name: 'cuddle',
	
	help_args: '[user]',
	desc: 'Cuddles',
	allowUserArgument: true,
	
	func: defAction('cuddle', 'cuddles'),
});

DBot.RegisterCommand({
	name: 'rub',
	
	help_args: '[user]',
	desc: 'Rubs',
	allowUserArgument: true,
	
	func: defAction('rub', 'rubs body of'),
});

DBot.RegisterCommand({
	name: 'stroke',
	
	help_args: '[user]',
	desc: 'Strokes',
	allowUserArgument: true,
	
	func: defAction('stroke', 'slowly strokes'),
});

DBot.RegisterCommand({
	name: 'sit',
	
	help_args: '',
	desc: 'Sits',
	
	func: function(args, cmd, msg) {
		if (args[0])
			msg.sendMessage('<@' + msg.author.id + '> *sits on ' + args[0] + ' *');
		else
			msg.sendMessage('<@' + msg.author.id + '> *sits*');
	},
});

DBot.RegisterCommand({
	name: 'jump',
	
	help_args: '',
	desc: 'Jumps',
	
	func: function(args, cmd, msg) {
		if (args[0])
			msg.sendMessage('<@' + msg.author.id + '> *jumps on ' + args[0] + ' *');
		else
			msg.sendMessage('<@' + msg.author.id + '> *jumps around*');
	},
});

DBot.RegisterCommand({
	name: 'sleep',
	
	help_args: '',
	desc: 'Sleeps',
	
	func: function(args, cmd, msg) {
		if (args[0])
			msg.sendMessage('<@' + msg.author.id + '> *sleeps on ' + args[0] + ' *');
		else
			msg.sendMessage('<@' + msg.author.id + '> *sleeps on a bed*');
	},
});

DBot.RegisterCommand({
	name: 'lay',
	alias: ['lays'],
	
	help_args: '',
	desc: 'Lays',
	
	func: function(args, cmd, msg) {
		if (args[0])
			msg.sendMessage('<@' + msg.author.id + '> *lays on ' + args[0] + ' *');
		else
			msg.sendMessage('<@' + msg.author.id + '> *lays*');
	},
});

DBot.RegisterCommand({
	name: 'slap',
	
	help_args: '[user]',
	desc: 'Slaps',
	allowUserArgument: true,
	
	func: defAction('slap', 'softly slaps'),
});

DBot.RegisterCommand({
	name: 'shitbot',
	alias: ['shittybot'],
	
	help_args: '',
	desc: '',
	allowUserArgument: true,
	help_hide: true,
	
	func: function(args, cmd, msg) {
		return 'You aren\'t better';
	},
});

DBot.RegisterCommand({
	name: 'shit',
	alias: ['shitty'],
	
	help_args: '',
	desc: '',
	allowUserArgument: true,
	help_hide: true,
	
	func: function(args, cmd, msg) {
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
	alias: ['dick', 'cunt'],
	
	help_args: '',
	desc: 'rood',
	allowUserArgument: true,
	help_hide: true,
	
	func: function(args, cmd, msg) {
		msg.sendMessage('Rood');
	}
});

DBot.RegisterCommand({
	name: 'fuck',
	
	help_args: '',
	desc: 'rood',
	allowUserArgument: true,
	help_hide: true,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			msg.sendMessage('No buttfucking');
		else
			msg.sendMessage('Fuck you <@' + msg.author.id + '>');
	}
});