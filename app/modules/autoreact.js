
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
		['lit', 'fire', 'flame', emojiModule.getEmojiByName('fire')],
		['flame']
	],
	
	[
		['hot', 'lewd', 'lewds', 'lewdy'],
		['thermometer']
	],
	
	[
		['snek', 'snaek', 'snake', 'danger noodle', 'sneaky', 'hiss+', emojiModule.getEmojiByName('snake')],
		['snake']
	],
	
	[
		['ok', 'okay', 'okai', emojiModule.getEmojiByName('ok')],
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
		['thinking', 'thokang', 'thokaning', emojiModule.getEmojiByName('thinking')],
		['thinking']
	],
	
	[
		[':\\(', emojiModule.getEmojiByName('slight_frown')],
		['slight_frown']
	],
	
	[
		[':\\)', emojiModule.getEmojiByName('grinning'), emojiModule.getEmojiByName('smiley')],
		['grinning', 'smile_cat']
	],
	
	[
		[':P', emojiModule.getEmojiByName('stuck_out_tongue'), emojiModule.getEmojiByName('stuck_out_tongue_closed_eyes')],
		['stuck_out_tongue', 'stuck_out_tongue_closed_eyes']
	],
	
	[
		[':D', emojiModule.getEmojiByName('smile')],
		['smile']
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
		['magic', 'sparkles', emojiModule.getEmojiByName('sparkles')],
		['sparkles']
	],
	
	[
		['o', emojiModule.getEmojiByName('open_mouth')],
		['open_mouth']
	],
	
	[
		[':\\|', ':/', ':\\\\', emojiModule.getEmojiByName('confused')],
		['confused']
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
		['lol', 'loal', 'joy', 'lmao', 'rofl', 'joy', 'xd', emojiModule.getEmojiByName('joy')],
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
	],
	
	[
		['twisted'],
		['twisted_rightwards_arrows']
	],
	
	[
		['fast forward', 'forward'],
		['fast_forward']
	],
	
	[
		['rewind'],
		['rewind']
	],
	
	// Numbers
	
	[
		['one', '1'],
		['one']
	],

	[
		['two', '2'],
		['two']
	],

	[
		['three', '3'],
		['three']
	],

	[
		['four', '4'],
		['four']
	],

	[
		['five', '5'],
		['five']
	],

	[
		['six', '6'],
		['six']
	],

	[
		['seven', '7'],
		['seven']
	],

	[
		['eight', '8'],
		['eight']
	],

	[
		['nine', '9'],
		['nine']
	],

	[
		['zero', '0'],
		['zero']
	],

	[
		['keycap_ten', '10', 'ten'],
		['keycap_ten']
	]
];

const arrowsEmoji = [
	'arrow_backward',
	'arrow_down',
	'arrow_forward',
	'arrow_left',
	'arrow_lower_left',
	'arrow_lower_right',
	'arrow_right',
	'arrow_up',

	'arrow_double_down',
	'arrow_double_up',

	'arrow_heading_down',
	'arrow_heading_up',
	'arrow_up_small'
];

const simpleEmojiReact = [
	'sunny',
	'umbrella',
	'cloud',
	'snowflake',
	'snowman',
	'zap',
	'cyclone',
	'foggy',
	'ocean',
	'cat',
	'dog',
	'mouse',
	'hamster',
	'rabbit',
	'wolf',
	'frog',
	'tiger',
	'koala',
	'bear',
	'pig',
	'pig_nose',
	'cow',
	'boar',
	'monkey_face',
	'monkey',
	'horse',
	'racehorse',
	'camel',
	'sheep',
	'elephant',
	'panda_face',
	'snake',
	'bird',
	'baby_chick',
	'hatched_chick',
	'hatching_chick',
	'chicken',
	'penguin',
	'turtle',
	'bug',
	'ant',
	'beetle',
	'snail',
	'octopus',
	'tropical_fish',
	'fish',
	'whale',
	'whale2',
	'dolphin',
	'cow2',
	'ram',
	'rat',
	'water_buffalo',
	'tiger2',
	'rabbit2',
	'dragon',
	'goat',
	'rooster',
	'dog2',
	'pig2',
	'mouse2',
	'ox',
	'dragon_face',
	'blowfish',
	'crocodile',
	'dromedary_camel',
	'leopard',
	'cat2',
	'poodle',
	'paw_prints',
	'bouquet',
	'cherry_blossom',
	'tulip',
	'four_leaf_clover',
	'rose',
	'sunflower',
	'hibiscus',
	'maple_leaf',
	'leaves',
	'fallen_leaf',
	'herb',
	'mushroom',
	'cactus',
	'palm_tree',
	'evergreen_tree',
	'deciduous_tree',
	'chestnut',
	'seedling',
	'blossom',
	'ear_of_rice',
	'shell',
	'globe_with_meridians',
	'sun_with_face',
	'full_moon_with_face',
	'new_moon_with_face',
	'new_moon',
	'waxing_crescent_moon',
	'first_quarter_moon',
	'waxing_gibbous_moon',
	'full_moon',
	'waning_gibbous_moon',
	'last_quarter_moon',
	'waning_crescent_moon',
	'last_quarter_moon_with_face',
	'first_quarter_moon_with_face',
	'crescent_moon',
	'earth_africa',
	'earth_americas',
	'earth_asia',
	'volcano',
	'milky_way',
	'partly_sunny'
];

{
	const clock = [];
	
	for (let i = 1; i <= 12; i++)
		clock.push('clock' + i);
	
	reactions.push([['time', 'clock', 'oclock', 'alarm'], clock]);
}

for (const em of simpleEmojiReact) {
	reactions.push([[emojiModule.getEmojiByName(em), em.replace(/_/g, ' '), em], [em]]);
}

for (const em of arrowsEmoji) {
	reactions.push([
		[emojiModule.getEmojiByName(em), em.replace(/_/g, ' '), em, em.substr(6), em.substr(6).replace(/_/g, '')],
		[em]
	]);
}

for (const ar of reactions) {
	ar[2] = [];
}

for (const ar of reactions) {
	for (const trigger in ar[0]) {
		try {
			ar[0][trigger] = new RegExp('(^| )' + ar[0][trigger] + '( |$|!|\\*|\\.)', 'i');
		} catch(err) {
			console.error('Emoji: ' + ar[0] + ', outputs: ' + ar[1].join(', '));
			console.error(err);
		}
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

hook.Add('OnValidMessage', 'AutoReact', OnValidMessage);
