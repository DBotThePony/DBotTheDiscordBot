

// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

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

const defAction = function(name, data) {
	data = data || {};
	const cActionID = nextActionID;
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
			
			if (actor.id === target.id)
				return DBot.CommandError('alone', name, args, 1);
			
			if (data.immunity && (target.id === DBot.bot.id || DBot.owners.includes(target.id)) && !DBot.owners.includes(msg.author.id))
				return DBot.CommandError('too stronk for you', name, args, 1);
			
			Postgres.query(`INSERT INTO rp_actions VALUES (${actorUID}, ${cActionID}, ${DBot.GetUserID(target)}, 1) ON CONFLICT ("ACTOR", "ACTION", "TARGET") DO UPDATE SET "COUNT" = rp_actions."COUNT" + 1 RETURNING "COUNT"`, (err, sdata) =>
				msg.sendMessage(`_<@${actor.id}> ${data.text} <@${target.id}> (it is ${sdata[0] && sdata[0].COUNT || 1} times now)_`));
		} else {
			if (typeof args[0] === 'object')
				target = args[0];
			
			actor = msg.author;
			actorUID = DBot.GetUserID(actor);
			
			if (target && actor.id === target.id)
				return DBot.CommandError('alone', name, args, 1);
			
			if (target) {
				Postgres.query(`INSERT INTO rp_actions VALUES (${actorUID}, ${cActionID}, ${DBot.GetUserID(target)}, 1) ON CONFLICT ("ACTOR", "ACTION", "TARGET") DO UPDATE SET "COUNT" = rp_actions."COUNT" + 1 RETURNING "COUNT"`, (err, sdata) =>
					msg.sendMessage(`_<@${actor.id}> ${data.text} <@${target.id}> (it is ${sdata[0] && sdata[0].COUNT || 1} times now)_`));
			} else {
				Postgres.query(`INSERT INTO rp_actions VALUES (${actorUID}, ${cActionID}, -1, 1) ON CONFLICT ("ACTOR", "ACTION", "TARGET") DO UPDATE SET "COUNT" = rp_actions."COUNT" + 1 RETURNING "COUNT"`, (err, sdata) =>
					msg.sendMessage(`_<@${actor.id}> ${data.textSelf} (it is ${sdata[0] && sdata[0].COUNT || 1} times now)_`));
			}
		}
	};
};

module.exports = {
	name: 'hug',
	
	help_args: '[user]',
	desc: 'Hugs? ^w^',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('hug', {text: 'hugs'})
};


DBot.RegisterCommand({
	name: 'shitbot',
	alias: ['shittybot'],
	
	help_args: '',
	desc: '',
	allowUserArgument: true,
	help_hide: true,
	delay: 0,
	
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
	delay: 0,
	
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
	delay: 0,
	
	func: function(args, cmd, msg) {
		msg.sendMessage('Rood');
	}
});

DBot.RegisterCommand({
	name: 'bleach',
	alias: ['drinkbleach'],
	
	help_args: '',
	desc: '',
	allowUserArgument: true,
	help_hide: true,
	delay: 0,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			msg.sendMessage('You should do not do that');
		else
			msg.sendMessage('You should not tell anyone to do that');
	}
});

DBot.RegisterCommand({
	name: 'poke',
	
	help_args: '[user]',
	desc: 'Pokes',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('poke', {text: 'pokes'})
});

DBot.RegisterCommand({
	name: 'punch',
	
	help_args: '[user]',
	desc: 'Punches',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('punch', {text: 'punches'})
});

DBot.RegisterCommand({
	name: 'squeeze',
	
	help_args: '[user]',
	desc: 'Squeezes',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('squeeze', {text: 'hugs tight'})
});

DBot.RegisterCommand({
	name: 'cuddle',
	
	help_args: '[user]',
	desc: 'Cuddles',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('cuddle', {text: 'cuddles'})
});

DBot.RegisterCommand({
	name: 'rub',
	
	help_args: '[user]',
	desc: 'Rubs',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('rub', {text: 'rubs body of'})
});

DBot.RegisterCommand({
	name: 'stroke',
	
	help_args: '[user]',
	desc: 'Strokes',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('stroke', {text: 'slowly strokes'})
});

DBot.RegisterCommand({
	name: 'sit',
	
	help_args: '',
	desc: 'Sits',
	allowUserArgument: true,
	delay: 0,
	
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
	delay: 0,
	
	func: defAction('stroke', {text: 'sleeps on', textSelf: 'sleeps on a bed', self: true})
});

DBot.RegisterCommand({
	name: 'lay',
	alias: ['lays'],
	
	help_args: '',
	desc: 'Lays',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('stroke', {text: 'lays on', textSelf: 'lays', self: true})
});

DBot.RegisterCommand({
	name: 'slap',
	
	help_args: '[user]',
	desc: 'Slaps',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('slap', {text: 'softly slaps'})
});

DBot.RegisterCommand({
	name: 'boop',
	
	help_args: '[user]',
	desc: 'Pokes',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('boop', {text: 'just booped'})
});

DBot.RegisterCommand({
	name: 'lick',
	alias: ['noselicks', 'licknose'],
	
	help_args: '[user]',
	desc: 'Nose licks',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('lick', {text: 'nose licks'})
});

DBot.RegisterCommand({
	name: 'brush',
	
	help_args: '[user]',
	desc: 'Hair brushes',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('brush', {text: 'brushes mane of'})
});

DBot.RegisterCommand({
	name: 'earnom',
	alias: ['earbite'],
	
	help_args: '[user]',
	desc: 'nom',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('earnom', {text: 'softly bites ears of'})
});

DBot.RegisterCommand({
	name: 'chokeslam',
	
	help_args: '[user]',
	desc: 'CHOKE AND SLAM',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('chokeslam', {text: 'CHOKES AND SLAMS'})
});

DBot.RegisterCommand({
	name: 'sniff',
	
	help_args: '[user]',
	desc: 'sniffs',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('sniff', {text: 'sniff'})
});

DBot.RegisterCommand({
	name: 'manebite',
	alias: ['manenom', 'nommane', 'bitemane'],
	
	help_args: '[user]',
	desc: 'nom',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('manebite', {text: 'chews mane of'})
});

DBot.RegisterCommand({
	name: 'nom',
	alias: ['nosenom', 'nomnose'],
	
	help_args: '[user]',
	desc: 'Nose noms',
	allowUserArgument: true,
	delay: 0,
	
	func: defAction('nom', {text: 'nose noms'})
});

DBot.RegisterCommand({
	name: 'fuck',
	
	help_args: '',
	desc: 'rood',
	allowUserArgument: true,
	help_hide: true,
	delay: 0,
	
	rpfunc: defAction('fuck', {text: 'fucks', immunity: true}),
	
	func: function(args, cmd, msg) {
		if (!DBot.channelIsNSFW(msg.channel)) {
			if (!args[0])
				msg.sendMessage('No buttfucking');
			else
				msg.sendMessage('Fuck you <@' + msg.author.id + '>');
		} else {
			return this.self.rpfunc.call(this, args, cmd, msg);
		}
	}
});

