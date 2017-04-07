
/* global FCVAR_BOOLONLY */

// 
// Copyright (C) 2017 DBot
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
	['lit', 'flame'],
	['fire', 'flame'],
	['hot', 'flame'],
	['snek', 'snake'],
	['ok', 'ok'],
	['cool', 'sunglasses'],
	['eye', 'eyes'],
	['new', 'new'],
	['free', 'free'],
	['time', 'clock3'],
	['scream', 'loudspeaker'],
	['book', 'closed_book'],
	['mail', 'mailbox_with_mail'],
	['syringe', 'syringe'],
	['bleed', 'syringe'],
	['draco', 'dragon'],
	['dragon', 'dragon'],
	['cactus', 'cactus'],
	['dog', 'poodle'],
	['cat', 'cat2'],
	['horse', 'racehorse'],
	['mouse', 'mouse2'],
	['butterfly', 'butterfly'],
	['pizza', 'pizza'],
	['tada', 'tada'],
	['confetti', 'tada'],
	['surprise', 'tada'],
	['police', 'oncoming_police_car'],
	['love', 'blue_heart']
];

for (const ar of reactions) {
	ar[0] = new RegExp('(^| )' + ar[0] + '( |$)', 'i');
	ar[2] = emojiModule.getEmojiByName(ar[1]);
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
	
	let i = 0;
	
	for (const data of reactions) {
		if (msg.content.match(data[0])) {
			i++;
			msg.react(data[2]).catch(console.error);
		}
		
		if (i > 5)
			break;
	}
};

hook.Add('OnValidMessage', 'CommandHelper', OnValidMessage);
