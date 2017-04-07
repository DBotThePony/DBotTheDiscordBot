
/* global FCVAR_CHANNELONLY */

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

const myGlobals = require('./globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

Util.SafeCopy('./node_modules/moment/moment.js', DBot.WebRoot + '/moment.js');
Util.SafeCopy('./node_modules/numeral/numeral.js', DBot.WebRoot + '/numeral.js');
Util.SafeCopy('./resource/files/jquery-3.0.0.min.js', DBot.WebRoot + '/jquery-3.0.0.min.js');
Util.SafeCopy('./resource/files/noavatar.jpg', DBot.WebRoot + '/no_avatar.jpg');

const crypto = require('crypto');
const fs = require('fs');

for (const file of fs.readdirSync('./app/webroot')) {
	Util.Copy('./app/webroot/' + file, DBot.WebRoot + '/' + file);
}

Util.mkdir(DBot.WebRoot + '/fonts', function() {
	for (const file of fs.readdirSync('./resource/webfonts')) {
		Util.SafeCopy('./resource/webfonts/' + file, DBot.WebRoot + '/fonts/' + file);
	}
});

global.UnixStamp = function() {
	return (new Date()).getTime() / 1000;
};

global.CurTime = global.UnixStamp;
global.Systime = global.UnixStamp;
global.RealTime = global.UnixStamp;

let cooldown = 0;
let statusTimerID;
let lastRequestedStatus;

DBot.Status = function(newStatus) {
	if (cooldown > CurTime()) {
		if (statusTimerID) {
			lastRequestedStatus = newStatus;
			return;
		};
		
		lastRequestedStatus = newStatus;
		
		statusTimerID = setTimeout(function() {
			DBot.bot.user.setGame(lastRequestedStatus);
			statusTimerID = null;
		}, 10000);
		return;
	}
	
	cooldown = CurTime() + 10;
	
	DBot.bot.user.setGame(newStatus);
};

DBot.pugRender = function(path, data) {
	try {
		return require('pug').renderFile('./app/templates/' + path, data);
	} catch(err) {
		console.error(err);
		return '';
	}
};

DBot.IsMyMessage = function(msg) {
	return msg.author.id === DBot.bot.user.id;
};

DBot.IsPM = function(msg) {
	return msg.channel.type === 'dm';
};

DBot.InitVars = function() {
	DBot.id = DBot.bot.user.id;
	DBot.askId = '<@' + DBot.bot.user.id + '>';
	DBot.askIdC = '<@' + DBot.bot.user.id + '> ';
	DBot.askId2 = '<@!' + DBot.bot.user.id + '>';
	DBot.askIdC2 = '<@!' + DBot.bot.user.id + '> ';
	
	DBot.idLen = DBot.id.length;
	DBot.aidLen = DBot.askId.length;
	DBot.aidcLen = DBot.askIdC.length;
	DBot.aidLen2 = DBot.askId2.length;
	DBot.aidcLen2 = DBot.askIdC2.length;
};

cvars.ServerVar('notify_channel', '', [FCVAR_CHANNELONLY], 'Channel to threat as notifications channel');

DBot.GetNotificationChannel = function(server) {
	let get = cvars.Server(server).getVar('notify_channel').getChannel();
	
	if (get)
		return get;
	
	let channels = server.channels.array();
	
	for (let channel of channels) {
		if (channel.name.match('shitposting') || channel.name === 'notifications' || channel.name === 'notification') {
			get = channel;
			break;
		}
	}
	
	return get || server.defaultChannel;
};

DBot.FormatAsk = function(user) {
	return '<@' + user.id + '>, ';
};

DBot.UserIsGarbage = function(userID) {
	if (DBot.bot.users.has(userID)) return false;
	// ???
	
	for (const [_sid, server] of DBot.bot.guilds)
		for (const [memberID, member] of server.members)
			if (userID === memberID)
				return false;
	
	return true;
};

DBot.GetUsers = function() {
	const output = {};
	const reply = [];
	
	for (const [_sid, server] of DBot.bot.guilds)
		for (const [memberID, member] of server.members)
			if (!output[memberID])
				output[memberID] = member.user;
	
	for (const k in output)
		reply.push(output[k]);
	
	return reply;
};

DBot.GetUserServers = function(user) {
	const id = user.id;
	const servers = [];
	
	for (const [_sid, server] of DBot.bot.guilds)
		for (const [memberID, member] of server.members)
			if (id === memberID)
				servers.push(server);
	
	return servers;
};

DBot.GetMembers = function() {
	let members = [];
	
	for (const [sid, server] of DBot.bot.guilds)
		for (const [id, member] of server.members)
			members.push(member);
	
	return members;
};

DBot.RefreshData = function() {
	hook.Run('Refresh');
};

DBot.IdentifyUser = function(str) {
	let len = str.length;
	
	if (str.substr(0, 2) !== '<@')
		return false;
	
	if (str.substr(len - 1, 1) !== '>')
		return false;
	
	if (str.substr(0, 3) !== '<@!')
		return DBot.client.users.get(str.substr(2, len - 3));
	else
		return DBot.client.users.get(str.substr(3, len - 4));
};

DBot.CommandError = function(message, name, args, argID) {
	return message + '\n' + Util.HighlightHelp([name], 1 + argID, args) + 'Help:\n```' + DBot.BuildHelpStringForCommand(name) + '```\n';
};

DBot.GetImmunityLevel = function(member) {
	if (member.user.id === member.guild.owner.user.id)
		return 9999999;
	
	let max = 0;
	
	for (let role of member.roles.array()) {
		if (role.position > max)
			max = role.position;
	}
	
	return max;
};

DBot.CanTarget = function(member_user, member_target) {
	if (DBot.owners.includes(member_user.user.id))
		return true;
	
	if (DBot.owners.includes(member_target.user.id) && member_user.user.id !== DBot.bot.user.id)
		return false;
	
	if (DBot.owners.includes(member_target.user.id) && member_user.user.id === DBot.bot.user.id)
		return true;
	
	if (member_user.user.id === member_target.user.id)
		return true;
	
	return DBot.GetImmunityLevel(member_user) > DBot.GetImmunityLevel(member_target);
};

DBot.validPerms = [
	'CREATE_INSTANT_INVITE',
	'KICK_MEMBERS',
	'BAN_MEMBERS',
	'ADMINISTRATOR',
	'MANAGE_CHANNELS',
	'MANAGE_GUILD',
	'ADD_REACTIONS', // add reactions to messages
	'READ_MESSAGES',
	'SEND_MESSAGES',
	'SEND_TTS_MESSAGES',
	'MANAGE_MESSAGES',
	'EMBED_LINKS',
	'ATTACH_FILES',
	'READ_MESSAGE_HISTORY',
	'MENTION_EVERYONE',
	'EXTERNAL_EMOJIS', // use external emojis
	'CONNECT', // connect to voice
	'SPEAK', // speak on voice
	'MUTE_MEMBERS', // globally mute members on voice
	'DEAFEN_MEMBERS', // globally deafen members on voice
	'MOVE_MEMBERS', // move member's voice channels
	'USE_VAD', // use voice activity detection
	'CHANGE_NICKNAME',
	'MANAGE_NICKNAMES', // change nicknames of others
	'MANAGE_ROLES_OR_PERMISSIONS',
	'MANAGE_WEBHOOKS',
	'MANAGE_EMOJIS'
];

DBot.findRole = function(server, roleName, multi) {
	let mrole = null;
	let roleArray = [];
	roleName = roleName.toLowerCase();

	for (const role of server.roles.values()) {
		if (role.name.toLowerCase() === roleName) {
			return role;
		}
	}
	
	if (!mrole) {
		for (const role of server.roles.values()) {
			if (role.name.toLowerCase().match(roleName)) {
				mrole = role;
				if (multi) {
					if (!roleArray.includes(role)) roleArray.push(role);
				} else break;
			}
		}
	}
	
	if (multi && roleArray.length > 1)
		return roleArray;
	else
		return mrole;
};

DBot.channelIsNSFW = function(channel, nopm) {
	if (channel.type === 'dm' && !nopm)
		return true;
	
	if ((channel.name || '').match('nsfw'))
		return true;
	
	if ((channel.topic || '').match('[nsfw]'))
		return true;
	
	return false;
};
