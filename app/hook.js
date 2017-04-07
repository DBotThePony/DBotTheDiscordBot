
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
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const hookObj = require('./lib/hook.js');
const hook = new hookObj();
myGlobals.hook = hook;

const botHooks = [
	['guildCreate', 'OnJoinedServer'],
	['guildDelete', 'OnLeftServer'],
	['guildEmojiCreate', 'EmojiCreated'],
	['guildEmojiDelete', 'EmojiDeleted'],
	['guildEmojiUpdate', 'EmojiUpdated'],
	['guildMemberAdd', 'ClientJoinsServer'],
	['guildMemberAvailable', 'ClientAvaliable'],
	['guildMemberUpdate', 'MemberChanges'],
	['guildMemberRemove', 'ClientLeftServer'],
	['guildUnavailable', 'ServerWentsDown'],
	['guildUpdate', 'ServerChanges'],
	['messageDelete', 'OnMessageDeleted'],
	['messageUpdate', 'OnMessageEdit'],
	['reconnecting', 'OnReconnect'],
	['roleCreate', 'RoleCreated'],
	['roleDelete', 'RoleDeleted'],
	['roleUpdate', 'RoleChanged'],
	['channelCreate', 'ChannelCreated'],
	['channelDelete', 'ChannelDeleted'],
	['channelUpdate', 'ChannelUpdates'],
	['userUpdate', 'UserChanges'],
	['typingStart', 'ChatStart'],
	['typingStop', 'ChatFinish']
];

for (const item of botHooks) {
	DBot.bot.on(item[0], (a, b, c, d, e) => hook.Run(item[1], a, b, c, d, e));
}

/* Custom Events */

hook.Add('RoleChanged', 'events', function(oldRole, newRole) {
	let diff = Array.MapDiff(newRole.members, oldRole.members);
	
	for (const member of diff[0]) {
		hook.Run('MemberRoleAdded', member, newRole);
	}
	
	for (const member of diff[1]) {
		hook.Run('MemberRoleRemoved', member, newRole);
	}
});

hook.Add('MemberChanges', 'events', function(oldM, newM) {
	if (oldM.nickname !== newM.nickname)
		hook.Run('MemberNicknameChanges', newM, oldM);
});

hook.Add('UserChanges', 'events', function(oldM, newM) {
	if (oldM.nickname !== newM.nickname)
		hook.Run('UserNicknameChanges', newM, oldM);
	
	if (oldM.avatarURL !== newM.avatarURL)
		hook.Run('UserAvatarChanges', newM, oldM);
});

hook.Add('ClientJoinsServer', 'Default', function(client) {
	if (client.user.id === DBot.client.id)
		return;
	
	hook.Run('ValidClientJoinsServer', client.user, client.guild, client);
	
	if (client.user.bot) {
		hook.Run('BotJoinsServer', client.user, client.guild, client);
	} else {
		hook.Run('HumanJoinsServer', client.user, client.guild, client);
	}
});

hook.Add('ClientAvaliable', 'Default', function(client) {
	if (client.user.id === DBot.client.id)
		return;
	
	hook.Run('ValidClientAvaliable', client.user, client.guild, client);
	
	if (client.user.bot) {
		hook.Run('BotAvaliable', client.user, client.guild, client);
	} else {
		hook.Run('HumanAvaliable', client.user, client.guild, client);
	}
});

hook.Add('ClientLeftServer', 'Default', function(client) {
	if (client.user.id === DBot.client.id)
		return;
	
	hook.Run('ValidClientLeftServer', client.user, client.guild, client);
	
	if (client.user.bot) {
		hook.Run('BotLeftServer', client.user, client.guild, client);
	} else {
		hook.Run('HumanLeftServer', client.user, client.guild, client);
	}
});

