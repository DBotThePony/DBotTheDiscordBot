

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

cvars.ChannelVar('noflood', '0', [FCVAR_BOOLONLY], 'Try to prevent channel flooding');
cvars.ChannelVar('flood_newlines', '15', [FCVAR_NUMERSONLY_UINT], 'Limit of new lines in one messages');
cvars.ChannelVar('flood_newlines_thersold', '75', [FCVAR_NUMERSONLY_UINT], 'Max of all new lines in all messages for last x seconds');
cvars.ChannelVar('flood_newlines_cooldown', '5', [FCVAR_NUMERSONLY_UINT], 'Cooldown of thersold in seconds');
cvars.ChannelVar('flood_trigger', '5', [FCVAR_NUMERSONLY_UINT], 'How much time user should wait after flood spam was triggered in seconds. This works on all triggers of flood detect');

cvars.ChannelVar('flood_messages', '10', [FCVAR_NUMERSONLY_UINT], 'Thersold of messages in X seconds');
cvars.ChannelVar('flood_chars', '3000', [FCVAR_NUMERSONLY_UINT], 'Thersold of chars sended in X seconds');
cvars.ChannelVar('flood_messages_time', '4', [FCVAR_NUMERSONLY_UINT], 'Reset time of messages count');
cvars.ChannelVar('flood_chars_time', '4', [FCVAR_NUMERSONLY_UINT], 'Reset time of chars count');

hook.Add('PreOnValidMessage', 'AntiFlood', function(msg) {
	if (DBot.IsPM(msg))
		return;
	
	if (!msg.member)
		return;
	
	let me = msg.channel.guild.member(DBot.bot.user);
	if (!me || !me.hasPermission('MANAGE_MESSAGES'))
		return;
	
	let member = msg.member;
	let cv = cvars.Channel(msg.channel);
	
	if (!cv.getVar('noflood').getBool())
		return;
	
	let cnt = msg.content.split('\n').length;
	let chars = msg.content.length;
	
	if (member.flood_trigger && member.flood_trigger > CurTime()) {
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('Stop flooding!');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		msg.delete();
		return true;
	}
	
	member.flood_newlines_thersold_last = member.flood_newlines_thersold_last || 0;
	member.flood_messages_time = member.flood_messages_time || 0;
	member.flood_chars_time = member.flood_chars_time || 0;
	
	if (member.flood_newlines_thersold_last < CurTime()) {
		member.flood_newlines_thersold_last = CurTime() + cv.getVar('flood_newlines_cooldown').getInt();
		member.flood_newlines_thersold = cnt;
	} else {
		member.flood_newlines_thersold += cnt;
	}
	
	if (member.flood_messages_time < CurTime()) {
		member.flood_messages_time = CurTime() + cv.getVar('flood_messages_time').getInt();
		member.flood_messages = 1;
	} else {
		member.flood_messages++;
	}
	
	if (member.flood_chars_time < CurTime()) {
		member.flood_chars_time = CurTime() + cv.getVar('flood_chars_time').getInt();
		member.flood_chars = chars;
	} else {
		member.flood_chars += chars;
	}
	
	if (cnt > cv.getVar('flood_newlines').getInt()) {
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('Message\ncontains\ntoo\nmany\nnew\nlines\nsad muzzle ;w;');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		msg.delete();
		return true;
	}
	
	if (member.flood_newlines_thersold > cv.getVar('flood_newlines_thersold').getInt()) {
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('You send too many messages with much new lines in so little time ;n;\nFlood ban is triggered ;w;');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		member.flood_trigger = CurTime() + cv.getVar('flood_trigger').getInt();
		
		msg.delete();
		return true;
	}
	
	if (member.flood_chars > cv.getVar('flood_chars').getInt()) {
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('Too many chars was sended in so little time, flood ban is triggered ;w;');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		member.flood_trigger = CurTime() + cv.getVar('flood_trigger').getInt();
		
		msg.delete();
		return true;
	}
	
	if (member.flood_messages > cv.getVar('flood_messages').getInt()) {
		if (!member.user.bot) {
			member.lastNotifyMessage = member.lastNotifyMessage || 0;
			
			if (member.lastNotifyMessage < CurTime()) {
				msg.author.sendMessage('Too many messages was sended in so little time, flood ban is triggered ;w;');
				member.lastNotifyMessage = CurTime() + 2;
			}
		}
		
		member.flood_trigger = CurTime() + cv.getVar('flood_trigger').getInt();
		
		msg.delete();
		return true;
	}
});
