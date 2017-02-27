
/* global hook, DBot */

global.hook = global.hook || {};
global.events = hook;
hook.Table = {};

hook.Add = function(event, id, func) {
	if (!event)
		return;
	
	if (!id)
		return;
	
	if (!func)
		return;
	
	if (!hook.Table[event])
		hook.Table[event] = {};
	
	hook.Table[event][id] = func;
};

hook.Remove = function(event, id) {
	if (!hook.Table[event])
		return;
	
	hook.Table[event][id] = undefined;
};

hook.Call = function(event, A, B, C, D, E, F, G) {
	if (!hook.Table[event]) {
		return;
	}
	
	for (let k in hook.Table[event]) {
		let func = hook.Table[event][k];
		let reply = func(A, B, C, D, E, F, G);
		
		if (reply !== undefined)
			return reply;
	}
};

hook.Run = hook.Call;

hook.GetTable = function() {
	return hook.Table;
};

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

hook.REGISTERED_HOOKS = false;

hook.RegisterEvents = function() {
	if (hook.REGISTERED_HOOKS) return;
	hook.REGISTERED_HOOKS = true;
	
	botHooks.forEach(function(item) {
		DBot.bot.on(item[0], function(a, b, c, d, e) {
			hook.Run(item[1], a, b, c, d, e);
		});
	});
};

const URL = require('url');
let URLMessages = {};
let URLMessagesImages = {};
let URLMessagesImages2 = {};

DBot.LastURLInChannel = function(channel) {
	let cid = channel.id;
	return URLMessages[cid];
};

DBot.LastURLImageInChannel = function(channel) {
	let cid = channel.id;
	return URLMessagesImages[cid];
};

DBot.LastURLImageInChannel2 = function(channel) {
	let cid = channel.id;
	return URLMessagesImages2[cid];
};

const imageExt = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|webp)(\?|\/)?/i;
const imageExtExt = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|gif|webp)(\?|\/)?/i;
const urlMatch = new RegExp('https?://([^ "\n]*)', 'g');
const urlMatchStrong = new RegExp('^https?://([^ "\n]*)$');

DBot.CheckURLImage = function(m) {
	if (!m)
		return false;
	
	let get = m.match(urlMatchStrong);

	if (!get)
		return false;
	
	let get2 = m.match(imageExt);
	
	if (get2)
		return true;
	else
		return false;
};

DBot.CheckURLImage2 = function(m) {
	if (!m)
		return false;
	
	let get = m.match(urlMatchStrong);

	if (!get)
		return false;
	
	let get2 = m.match(imageExtExt);
	
	if (get2)
		return true;
	else
		return false;
};

let messageParseFunc = function(msg) {
	let cid = msg.channel.id;
	
	if (msg.attachments) {
		let arr = msg.attachments.array();
		
		for (let k in arr) {
			if (arr[k].url && arr[k].url.match(imageExt)) {
				URLMessages[cid] = arr[k].url;
				URLMessagesImages[cid] = arr[k].url;
			}
		}
	}
	
	let Message = msg.content;
	
	let get = Message.match(urlMatch);
	
	if (!get)
		return;
	
	for (let i in get) {
		let url = get[i];
		
		if (url.match(imageExt)) {
			URLMessagesImages[cid] = url;
		}
		
		if (url.match(imageExtExt)) {
			URLMessagesImages2[cid] = url;
		}
		
		URLMessages[cid] = url;
	}
};

hook.Add('OnMessage', 'LastURLInChannel', messageParseFunc);

hook.Add('OnMessageEdit', 'LastURLInChannel', function(omsg, nmsg) {
	messageParseFunc(nmsg);
});

hook.Add('ChannelDeleted', 'LastURLInChannel', function(channel) {
	let cid = channel.id;
	URLMessages[cid] = undefined;
});

let usersCache = [];

hook.Add('UserInitialized', 'UpdateUserVars', function(user) {
	for (let u of usersCache)
		if (u.id === user.id) return;
	
	usersCache.push(user);
});

hook.Add('BotOnline', 'UpdateUserVars', function() {
	setTimeout(UpdateUserVars, 3000);
});

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
