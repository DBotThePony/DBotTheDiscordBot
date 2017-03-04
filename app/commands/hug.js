
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

let nextActionID = 0;

let defAction = function(name, data) {
	data = data || {};
	let cActionID = nextActionID;
	nextActionID++;
	
	return function(args, cmd, msg) {
		let actor;
		let target;
		let actorUID;
		
		if (!data.self) {
			if (!args[0]) {
				actor = DBot.bot.user;
				target = msg.author;
				actorUID = -999;
			} else if (typeof args[0] === 'object') {
				actor = msg.author;
				target = args[0];
				actorUID = DBot.GetUserID(actor);
			} else {
				return DBot.CommandError('Oh?', name, args, 1);
			}
			
			Postgres.query(`INSERT INTO rp_actions VALUES (${actorUID}, ${cActionID}, ${DBot.GetUserID(target)}, 1) ON CONFLICT ("ACTOR", "ACTION", "TARGET") DO UPDATE SET "COUNT" = rp_actions."COUNT" + 1 RETURNING "COUNT"`, (err, sdata) =>
				msg.sendMessage(`_ <@${actor.id}> ${data.text} <@${target.id}> (it is ${sdata[0] && sdata[0].COUNT || 1} times now) _`));
		} else {
			if (typeof args[0] === 'object')
				target = args[0];
			
			actor = msg.author;
			actorUID = DBot.GetUserID(actor);
			
			if (target) {
				Postgres.query(`INSERT INTO rp_actions VALUES (${actorUID}, ${cActionID}, ${DBot.GetUserID(target)}, 1) ON CONFLICT ("ACTOR", "ACTION", "TARGET") DO UPDATE SET "COUNT" = rp_actions."COUNT" + 1 RETURNING "COUNT"`, (err, sdata) =>
					msg.sendMessage(`_ <@${actor.id}> ${data.text} <@${target.id}> (it is ${sdata[0] && sdata[0].COUNT || 1} times now) _`));
			} else {
				Postgres.query(`INSERT INTO rp_actions VALUES (${actorUID}, ${cActionID}, -1, 1) ON CONFLICT ("ACTOR", "ACTION", "TARGET") DO UPDATE SET "COUNT" = rp_actions."COUNT" + 1 RETURNING "COUNT"`, (err, sdata) =>
					msg.sendMessage(`_ <@${actor.id}> ${data.textSelf} (it is ${sdata[0] && sdata[0].COUNT || 1} times now) _`));
			}
		}
	};
};

module.exports = {
	name: 'hug',
	
	help_args: '[user]',
	desc: 'Hugs? ^w^',
	allowUserArgument: true,
	
	func: defAction('hug', {text: 'hugs'})
};

DBot.RegisterCommand({
	name: 'poke',
	
	help_args: '[user]',
	desc: 'Pokes',
	allowUserArgument: true,
	
	func: defAction('poke', {text: 'pokes'})
});

DBot.RegisterCommand({
	name: 'punch',
	
	help_args: '[user]',
	desc: 'Punches',
	allowUserArgument: true,
	
	func: defAction('punch', {text: 'punches'})
});

DBot.RegisterCommand({
	name: 'squeeze',
	
	help_args: '[user]',
	desc: 'Squeezes',
	allowUserArgument: true,
	
	func: defAction('squeeze', {text: 'hugs tight'})
});

DBot.RegisterCommand({
	name: 'cuddle',
	
	help_args: '[user]',
	desc: 'Cuddles',
	allowUserArgument: true,
	
	func: defAction('cuddle', {text: 'cuddles'})
});

DBot.RegisterCommand({
	name: 'rub',
	
	help_args: '[user]',
	desc: 'Rubs',
	allowUserArgument: true,
	
	func: defAction('rub', {text: 'rubs body of'})
});

DBot.RegisterCommand({
	name: 'stroke',
	
	help_args: '[user]',
	desc: 'Strokes',
	allowUserArgument: true,
	
	func: defAction('stroke', {text: 'slowly strokes'})
});

DBot.RegisterCommand({
	name: 'sit',
	
	help_args: '',
	desc: 'Sits',
	allowUserArgument: true,
	
	func: defAction('stroke', {text: 'sits on', textSelf: 'sits', self: true})
});

DBot.RegisterCommand({
	name: 'jump',
	
	help_args: '',
	desc: 'Jumps',
	allowUserArgument: true,
	
	func: defAction('stroke', {text: 'jumps on', textSelf: 'jumps around', self: true})
});

DBot.RegisterCommand({
	name: 'sleep',
	
	help_args: '',
	desc: 'Sleeps',
	allowUserArgument: true,
	
	func: defAction('stroke', {text: 'sleeps on', textSelf: 'sleeps on a bed', self: true})
});

DBot.RegisterCommand({
	name: 'lay',
	alias: ['lays'],
	
	help_args: '',
	desc: 'Lays',
	allowUserArgument: true,
	
	func: defAction('stroke', {text: 'lays on', textSelf: 'lays', self: true})
});

DBot.RegisterCommand({
	name: 'slap',
	
	help_args: '[user]',
	desc: 'Slaps',
	allowUserArgument: true,
	
	func: defAction('slap', {text: 'softly slaps'})
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
	}
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
		else if (args[0] === 'bot')
			return 'fuck you';
		else
			return 'i don\'t care';
	}
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

DBot.RegisterCommand({
	name: 'boop',
	
	help_args: '[user]',
	desc: 'Pokes',
	allowUserArgument: true,
	
	func: defAction('boop', {text: 'just booped'})
});
