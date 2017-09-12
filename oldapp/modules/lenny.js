

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

'use strict';

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const lennyRegExp = /\([ ]* ͡°[ ]* ͜?ʖ[ ]* ͡°[ ]*\)/gi;

const lennys = [
	// Some my lennys
	'(       ͡°      ͜ʖ       ͡°      )',
	'(  ͡° ͡°  ʖ  ͡° ͡°  )',
	'(       ͡:eye:      ͜ʖ       ͡:eye:      )',
	'(   ͡:eye:   ͜ʖ   ͡:eye:   )',
	
	`(   ͡:eye: ͜ʖ ͡:eye: )
    ( (   ͡:eye: ͜ʖ ͡:eye: )
   (   (   ͡:eye: ͜ʖ ͡:eye: )
  (   ͡:eye: (   ͡:eye: ͜ʖ ͡:eye: )
 (   ͡:eye: ͜ʖ (   ͡:eye: ͜ʖ ͡:eye: )`,
	
	` (   ͡° ͜ʖ ͡° )
    ( (   ͡° ͜ʖ ͡° )
   (   (   ͡° ͜ʖ ͡° )
  (   ͡° (   ͡° ͜ʖ ͡° )
 (   ͡° ͜ʖ (   ͡° ͜ʖ ͡° )`,
	
	'(             ͡°            ͜ʖ            ͡°            )',
	
	// Some internet lennys
	'( ͡° ͜ʖ ͡°)',
	'( ͡° ͜ ͜ʖ ͡°)',
	'( ͡° ل͜ ͡°)',
	'( ° ͜ʖ °)',
	'(˵ ͡° ͜ʖ ͡°˵)',
	'( ͠° ͟ʖ ͡°)',
	'( ͠° ͟ʖ ͠°)',
	'( ͠° ͟ ͜ʖ ͡°)',
	'( ͠° ͟ ͜ʖ ͡ ͠°)',
	'ᕦ( ͡° ͜ʖ ͡°)ᕤ',
	'( ͡~ ͜ʖ ͡°) ( ͡o ͜ʖ ͡o)',
	'(˵ ͡o ͜ʖ ͡o˵)',
	' ͡	° ͜ʖ ͡ –',
	'✧ ( ͡͡ ° ͜ ʖ ͡ °)﻿',
	'( ͡° ͜ʖ ͡°)>⌐■-■',
	'( ͡⌐■ ͜ʖ ͡-■)',
	' (ง ͠° ͟ل͜ ͡°)ง',
	'( ͡☉ ͜ʖ ͡☉) ( ͡° ͜ʖ ͡ °)',
	'ʕ ͡° ͜ʖ ͡°ʔ',
	'( ͡o ͜ʖ ͡o)',
	'( ͡° ͜V ͡°)',
	'(☞ ͡° ͜ʖ ͡°)☞',
	'( ‾ ʖ̫ ‾)',
	'( ͡° ʖ̯ ͡°)',
	'ʕ ͡° ʖ̯ ͡°ʔ',
	'( ͡◉ ͜ʖ ͡◉)',
	'( ͡ᵔ ͜ʖ ͡ᵔ )',
	'( ͡°⁄ ⁄ ͜⁄ ⁄ʖ⁄ ⁄ ͡°)',
	'( ͡☉⁄ ⁄ ͜⁄ ͜ʖ̫⁄ ⁄ ͡☉)',
	'\\( ͡° ͜/// ͡°)/',
	'(´༎ຶ ͜ʖ ༎ຶ `)♡',
	'✺◟( ͡° ͜ʖ ͡°)◞✺ ',
	'( ͡° ͜ʖ ͡°)',
	'( ͠° ͟ʖ ͡°)',
	'ᕦ( ͡° ͜ʖ ͡°)ᕤ',
	'( ͡~ ͜ʖ ͡°)',
	'( ͡o ͜ʖ ͡o)',
	'͡° ͜ʖ ͡ -',
	'( ͡͡ ° ͜ ʖ ͡ °)',
	'( ͡ ͡° ͡° ʖ ͡° ͡°)',
	'( ͡° ͜ʖ ͡°)',
	'( ͡° ͜ʖ ͡ °)',
	'(ʖ ͜° ͜ʖ)',
	'[ ͡° ͜ʖ ͡°]',
	'(ง ͠° ͟ل͜ ͡°)ง',
	'( ͡o ͜ʖ ͡o)',
	'{ ͡• ͜ʖ ͡•}',
	'( ͡° ͜V ͡°)',
	'( ͡^ ͜ʖ ͡^)',
	'( ‾ʖ̫‾)',
	'( ͡°╭͜ʖ╮͡°)',
	'ᕦ( ͡°╭͜ʖ╮͡° )ᕤ',
	'ᗒ ͟ʖᗕ'
];

hook.Add('OnHumanMessage', 'Lenny', function(msg) {
	if (DBot.IsAskingMe(msg))
		return;
	
	if (hook.Run('CanReply', msg) === false)
		return;
	
	if (!DBot.IsPM(msg)) {
		let mute = cvars.Channel(msg.channel).getVar('mute');
		
		if (mute) {
			if (mute.getBool()) {
				return;
			}
		}
	}
	
	if (msg.content.match(lennyRegExp)) {
		msg.reply(Array.Random(lennys));
		return true;
	}
});

DBot.RegisterCommand({
	name: 'lenny',
	alias: ['lennyface'],

	help_args: '',
	help_hide: true,
	desc: '(  ͡° ͡°  ʖ  ͡° ͡°  )',
	delay: 2,
	
	func: function(args, cmd, msg) {
		return Array.Random(lennys);
	}
});
