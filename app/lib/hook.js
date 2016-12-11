
hook = {};
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
}

hook.Remove = function(event, id) {
	if (!hook.Table[event])
		return;
	
	hook.Table[event][id] = undefined;
}

hook.Call = function(event, A, B, C, D, E, F, G) {
	if (!hook.Table[event]) {
		return;
	}
	
	for (var k in hook.Table[event]) {
		var func = hook.Table[event][k];
		var reply = func(A, B, C, D, E, F, G);
		
		if (reply != undefined)
			return reply;
	}
}

hook.Run = hook.Call;

hook.GetTable = function() {
	return hook.Table;
}

var botHooks = [
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
];

hook.RegisterEvents = function() {
	botHooks.forEach(function(item) {
		DBot.bot.on(item[0], function(a, b, c, d, e) {
			hook.Run(item[1], a, b, c, d, e);
		});
	});
};

hook.Add('ClientJoinsServer', 'Default', function(client) {
	if (client.user.id == DBot.client.id)
		return;
	
	hook.Run('ValidClientJoinsServer', client.user, client.guild, client);
	
	if (client.user.bot) {
		hook.Run('BotJoinsServer', client.user, client.guild, client);
	} else {
		hook.Run('HumanJoinsServer', client.user, client.guild, client);
	}
});

hook.Add('ClientAvaliable', 'Default', function(client) {
	if (client.user.id == DBot.client.id)
		return;
	
	hook.Run('ValidClientAvaliable', client.user, client.guild, client);
	
	if (client.user.bot) {
		hook.Run('BotAvaliable', client.user, client.guild, client);
	} else {
		hook.Run('HumanAvaliable', client.user, client.guild, client);
	}
});

hook.Add('ClientLeftServer', 'Default', function(client) {
	if (client.user.id == DBot.client.id)
		return;
	
	hook.Run('ValidClientLeftServer', client.user, client.guild, client);
	
	if (client.user.bot) {
		hook.Run('BotLeftServer', client.user, client.guild, client);
	} else {
		hook.Run('HumanLeftServer', client.user, client.guild, client);
	}
});

const URL = require('url');
var URLMessages = {};
var URLMessagesImages = {};

var allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

DBot.LastURLInChannel = function(channel) {
	var cid = channel.id;
	return URLMessages[cid];
}

DBot.LastURLImageInChannel = function(channel) {
	var cid = channel.id;
	return URLMessagesImages[cid];
}

hook.Add('OnMessage', 'LastURLInChannel', function(msg) {
	var cid = msg.channel.id;
	
	if (msg.attachments) {
		var arr = msg.attachments.array();
		
		for (var k in arr) {
			if (arr[k].url) {
				URLMessages[cid] = arr[k].url;
				URLMessagesImages[cid] = arr[k].url;
			}
		}
	}
	
	var Message = msg.content;
	
	var get = Message.match(new RegExp('https?://([^ "\n]*)', 'g'));
	
	if (!get)
		return;
	
	for (var i in get) {
		var url = get[i];
		
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1];
		
		if (DBot.HaveValue(allowed, ext)) {
			URLMessagesImages[cid] = url;
		}
		
		URLMessages[cid] = url;
	}
});

hook.Add('ChannelDeleted', 'LastURLInChannel', function(channel) {
	var cid = channel.id;
	URLMessages[cid] = undefined;
});

let usersCache = [];

hook.Add('UserInitialized', 'UpdateUserVars', function(user) {
	usersCache.push(user);
});

var UpdateUserVars = function() {
	if (!IsOnline())
		return;
	
	if (!hook.Table['UpdateMemberVars'] && !hook.Table['UpdateUserVars'])
		return;
	
	var total = usersCache.length;
	if (total == 0)
		return;
	
	var timered = Math.floor(20000 / total);
	
	for (let i = 0; i < total; i++) {
		let user = usersCache[i];
		
		if (!DBot.UserIsInitialized(user)) {
			DBot.DefineUser(user);
			continue;
		}
		
		setTimeout(function() {
			hook.Run('UpdateUserVars',user );
		}, timered * i);
	}
	
	let servers = DBot.bot.guilds.array();
	let Members = [];
	
	for (let sid in servers) {
		let server = servers[sid];
		let members = server.members.array();
		
		for (let member of members) {
			let user = member.user;
			
			if (!DBot.UserIsInitialized(user)) {
				DBot.DefineUser(user);
				continue;
			}
			
			Members.push(member);
		}
	}
	
	let totalMembers = Members.length;
	let timeredMembers = Math.floor(20000 / totalMembers);
	
	for (let i = 0; i < totalMembers; i++) {
		setTimeout(function() {
			hook.Run('UpdateMemberVars', Members[i]);
		}, timeredMembers * i);
	}
}

setInterval(UpdateUserVars, 20000);

hook.Add('BotOnline', 'UpdateUserVars', function() {
	setTimeout(UpdateUserVars, 3000);
});
