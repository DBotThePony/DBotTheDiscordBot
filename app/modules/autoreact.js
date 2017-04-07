
/* global FCVAR_BOOLONLY */

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
const cvars = myGlobals.cvars;

const emojiModule = require('../lib/emoji.js');

const reactions = [
	[
		['lit', 'fire', 'flame'],
		['flame']
	],
	
	[
		['hot', 'lewd', 'lewds', 'lewdy'],
		['thermometer']
	],
	
	[
		['snek', 'snaek', 'snake', 'danger noodle', 'sneaky'],
		['snake']
	],
	
	[
		['ok', 'okay', 'okai'],
		['ok']
	],
	
	[
		['cool', 'kool', 'sun glasses', 'sunglasses'],
		['sunglasses']
	],
	
	[
		['eye', 'eyes'],
		['eyes']
	],
	
	[
		['horse', 'pony', 'pone', 'ponie', 'pne'],
		['racehorse']
	],
	
	[
		['tada', 'voila', 'confetti', 'surprise'],
		['tada']
	],
	
	[
		['love', 'heart', 'loveheart', 'luv', 'luvs'],
		['blue_heart', 'heart', 'hearts', 'yellow_heart', 'purple_heart', 'green_heart', 'two_hearts', 'heartbeat', 'cupid', 'revolving_hearts']
	],
	
	[
		['i miss', 'late'],
		['alarm_clock']
	],
	
	[
		['loud', 'scream'],
		['loudspeaker']
	],
	
	[
		['zap', 'lightning', 'fast', 'faster'],
		['zap']
	],
	
	[
		['book', 'dictionary', 'read'],
		['green_book', 'closed_book', 'blue_book', 'orange_book', 'books', 'book']
	],
	
	[
		['apple', 'apples'],
		['green_apple', 'apple']
	],
	
	[
		['lemon', 'lemons'],
		['lemon']
	],
	
	[
		['melon', 'melons'],
		['watermelon']
	],
	
	[
		['strawberry', 'berry', 'berries'],
		['strawberry']
	],
	
	[
		['peach', 'peaches'],
		['peach']
	],
	
	[
		['bread'],
		['bread']
	],
	
	[
		['candy'],
		['candy']
	],
	
	[
		['lollipop'],
		['lollipop']
	],
	
	[
		['chocolate'],
		['chocolate_bar']
	],
	
	[
		['popcorn'],
		['popcorn']
	],
	
	[
		['donut'],
		['doughnut']
	],
	
	[
		['art', 'artistic'],
		['art']
	],
	
	[
		['gift'],
		['gift']
	],
	
	[
		['brilliant', 'gem', 'diamond', 'ruby', 'perfect'],
		['gem']
	],
	
	[
		['hammer', 'destroy'],
		['hammer']
	],
	
	[
		['fix', 'repair'],
		['wrench']
	],
	
	[
		['bomb'],
		['bomb']
	],
	
	[
		['scissors'],
		['scissors']
	],
	
	[
		['gun', 'revolver', 'pistol', 'assault rifle'],
		['gun']
	],
	
	[
		['fruit', 'fruits'],
		['green_apple', 'apple', 'pear', 'tangerine', 'lemon', 'peach']
	],
	
	[
		['police'],
		['oncoming_police_car']
	],
	
	[
		['new'],
		['new']
	],
	
	[
		['!'],
		['exclamation']
	],
	
	[
		['!!'],
		['bangbang']
	],
	
	[
		['\\?'],
		['question']
	],
	
	[
		['\\?!', '!\\?'],
		['interrobang']
	],
	
	[
		['warning', 'onoh', 'oops', 'oh no', 'nooo+'],
		['warning']
	],
	
	[
		['octagon', 'stop'],
		['octagonal_sign']
	],
	
	[
		['lol', 'loal', 'joy', 'lmao', 'rofl'],
		['joy', 'joy_cat']
	],
	
	[
		['free'],
		['free']
	],
	
	[
		['mushroom'],
		['mushroom']
	],
	
	[
		['spider', 'coweb'],
		['spider_web']
	],
	
	[
		['mail'],
		['mailbox_with_mail']
	],
	
	[
		['sunny', 'sun'],
		['sun_with_face']
	],
	
	[
		['syringe'],
		['syringe']
	],
	
	[
		['boom', 'explosion'],
		['boom']
	],
	
	[
		['snowflake', 'snow', 'snowy', 'freezing', 'freezy', 'freeze'],
		['snowflake']
	],
	
	[
		['bleed'],
		['syringe']
	],
	
	[
		['lizard'],
		['lizard']
	],
	
	[
		['draco'],
		['dragon']
	],
	
	[
		['dragon'],
		['dragon']
	],
	
	[
		['cactus'],
		['cactus']
	],
	
	[
		['dog'],
		['poodle']
	],
	
	[
		['cat'],
		['cat2']
	],
	
	[
		['mouse'],
		['mouse2']
	],
	
	[
		['butterfly', 'fly', 'light', 'soft'],
		['butterfly']
	],
	
	[
		['shark'],
		['shark']
	],
	
	[
		['music', 'musical'],
		['musical_note']
	],
	
	[
		['pizza'],
		['pizza']
	]
];

{
	const clock = [];
	
	for (let i = 1; i <= 12; i++)
		clock.push('clock' + i);
	
	reactions.push([['time', 'clock', 'oclock', 'alarm'], clock]);
}

for (const ar of reactions) {
	ar[2] = [];
}

for (const ar of reactions) {
	for (const trigger in ar[0]) {
		ar[0][trigger] = new RegExp('(^| )' + ar[0][trigger] + '( |$|!)', 'i');
	}
	
	for (const emoji in ar[1]) {
		ar[2][emoji] = emojiModule.getEmojiByName(ar[1][emoji]);
		if (!ar[2][emoji])
			console.error(`Unable to find a map for ${ar[1][emoji]}!`);
	}
}

cvars.ServerVar('autoreact', '1', [FCVAR_BOOLONLY], 'Lit reactions');

const OnValidMessage = function(msg) {
	if (DBot.IsPM(msg))
		return;
	
	if (!cvars.Server(msg.channel.guild).getVar('autoreact').getBool())
		return;
	
	const me = msg.channel.guild.member(DBot.bot.user);
	if (!me || !me.hasPermission('ADD_REACTIONS'))
		return;
	
	if (msg.channel.guild.lastReact && msg.channel.guild.lastReact > CurTime())
		return;
	
	let i = 0;
	
	for (const data of reactions) {
		for (const matchings of data[0]) {
			if (msg.content.match(matchings)) {
				i++;
				msg.react(Array.Random(data[2])).catch(console.error);
				break;
			}
		}
		
		if (i > 5)
			break;
	}
	
	if (i !== 0) {
		msg.channel.guild.lastReact = CurTime() + 2;
	}
};

hook.Add('OnValidMessage', 'CommandHelper', OnValidMessage);
