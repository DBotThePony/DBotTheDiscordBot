
/* global Postgres, DBot, hook */

DBot.commBanCache = DBot.commBanCache || {};
const cache = DBot.commBanCache;
cache.server = cache.server || {};
cache.channel = cache.channel || {};
cache.member = cache.member || {};

DBot.DisallowCommandManipulate = [
	'invite', 'cban', 'ucban',
	'cuban', 'help', 'clist',
	'eval', 'reload'
];

class CommandBanClass {
	onBanned(command) {
		if (!this.ready)
			return;
		
		Postgres.query('INSERT INTO command_bans_' + this.realm + ' ("UID", "COMMAND") VALUES (' + this.uid + ', \'' + command + '\')');
	}
	
	onUnBanned(command) {
		if (!this.ready)
			return;
		
		Postgres.query('DELETE FROM command_bans_' + this.realm + ' WHERE "UID" = ' + this.uid + ' AND "COMMAND" = \'' + command + '\'');
	}
	
	addCommand(command) {
		if (DBot.HaveValue(this.bans, command))
			return false;
		
		this.bans.push(command);
		this.onBanned(command);
		return true;
	}
	
	rawban(command) {
		if (DBot.HaveValue(this.bans, command))
			return false;
		
		this.bans.push(command);
		return true;
	}
	
	banCommand(command) {
		return this.addCommand(command);
	}
	
	ban(command) {
		return this.addCommand(command);
	}
	
	removeCommand(command) {
		for (let i in this.bans) {
			if (this.bans[i] === command) {
				this.bans.splice(i, 1);
				this.onUnBanned(command);
				return true;
			}
		}
		
		return false;
	}
	
	deleteTag(command) {
		return this.removeCommand(command);
	}
	
	unBanTag(command) {
		return this.removeCommand(command);
	}
	
	unBan(command) {
		return this.removeCommand(command);
	}
	
	isBanned(command) {
		return DBot.HaveValue(this.bans, command.toLowerCase());
	}
	
	bannedTags() {
		return this.bans;
	}
	
	getBannedTags() {
		return this.bans;
	}
	
	generateList() {
		if (this.bans[0])
			return '```' + this.bans.join(', ') + '```';
		else
			return 'none';
	}
	
	fetch() {
		let self = this;
		
		Postgres.query('SELECT "COMMAND" FROM command_bans_' + this.realm + ' WHERE "UID" = \'' + this.uid + '\'', function(err, data) {
			if (err) throw err;
			
			for (let row of data) {
				self.ban(row.COMMAND);
			}
			
			self.ready = true;
			hook.Run('CommandBansInitialized', self.obj, self);
		});
		
		return this;
	}
	
	constructor(obj, realm, IDFunc) {
		this.bans = [];
		this.obj = obj;
		this.realm = realm;
		this.ready = false;
		this.uid = IDFunc(obj);
	}
}

DBot.ServerCBans = function(server) {
	if (cache.server[server.uid])
		return cache.server[server.uid];
	
	cache.server[server.uid] = new CommandBanClass(server, 'server', DBot.GetServerID);
	cache.server[server.uid].fetch();
	return cache.server[server.uid];
};

DBot.ChannelCBans = function(channel) {
	if (cache.channel[channel.uid])
		return cache.channel[channel.uid];
	
	cache.channel[channel.uid] = new CommandBanClass(channel, 'channel', DBot.GetChannelID);
	cache.channel[channel.uid].fetch();
	return cache.channel[channel.uid];
};

DBot.MemberCBans = function(member) {
	if (cache.member[member.uid])
		return cache.member[member.uid];
	
	cache.member[member.uid] = new CommandBanClass(member, 'member', DBot.GetMemberID);
	cache.member[member.uid].fetch();
	return cache.member[member.uid];
};

hook.Add('PreDeleteChannel', 'ChannelBans', function(obj) {
	cache.channel[obj.uid] = undefined;
});

hook.Add('PreDeleteServer', 'ServerBans', function(obj) {
	cache.server[obj.uid] = undefined;
});

hook.Add('UpdateLoadingLevel', 'CommandBans', function(callFunc) {
	callFunc(true, 2);
});

hook.Add('ServerInitialized', 'ServerBans', function(server) {
	if (!DBot.SQLReady()) return;
	DBot.ServerCBans(server);
});

hook.Add('ServersInitialized', 'ServerBans', function(servers) {
	for (let server of servers) {
		if (!cache.server[server.uid])
			cache.server[server.uid] = new CommandBanClass(server, 'server', DBot.GetServerID);
	}
	
	Postgres.query('SELECT command_bans_server."UID", "COMMAND" FROM command_bans_server, servers WHERE command_bans_server."UID" = servers."ID" AND servers."TIME" > currtime() - 120', function(err, data) {
		if (err) throw err;
		DBot.updateLoadingLevel(false);
		
		for (let row of data) {
			let ob = cache.server[row.UID];
			if (ob) ob.ban(row.COMMAND);
		}
		
		for (let server of servers) {
			cache.server[server.uid].ready = true;
		}
	});
});

hook.Add('ChannelInitialized', 'ChannelBans', function(channel) {
	if (!DBot.SQLReady()) return;
	DBot.ChannelCBans(channel);
});

hook.Add('ChannelsInitialized', 'ServerBans', function(channels) {
	for (let channel of channels) {
		if (!cache.channel[channel.uid])
			cache.channel[channel.uid] = new CommandBanClass(channel, 'channel', DBot.GetChannelID);
	}
	
	Postgres.query('SELECT command_bans_channel."UID", "COMMAND" FROM command_bans_channel, channels WHERE command_bans_channel."UID" = channels."ID" AND channels."TIME" > currtime() - 120', function(err, data) {
		if (err) throw err;
		DBot.updateLoadingLevel(false);
		
		for (let row of data) {
			let ob = cache.channel[row.UID];
			if (ob) ob.ban(row.COMMAND);
		}
		
		for (let channel of channels) {
			cache.channel[channel.uid].ready = true;
		}
	});
});

DBot.RegisterMemberConstructor('CommandBans', function(self) {
	self.channelBans = [];
});

DBot.RegisterMemberMethod('unMuteBot', function() {
	this.totalMute = false;
	Postgres.query('DELETE FROM command_banned_member WHERE "UID" = ' + this.uid);
});

DBot.RegisterMemberMethod('muteBot', function() {
	if (this.totalMute)
		return false;

	this.totalMute = true;

	Postgres.query('INSERT INTO command_banned_member VALUES (' + this.uid + ')');
	return true;
});

DBot.RegisterMemberMethod('checkBotMute', function(channel) {
	if (this.totalMute)
		return true;

	if (this.channelBans.includes(DBot.GetChannelID(channel)))
		return true;

	return false;
});

DBot.RegisterMemberMethod('unMuteChannel', function(channel) {
	let uid = DBot.GetChannelID(channel);
	let hit = false;

	for (let i in this.channelBans) {
		if (this.channelBans[i] === uid) {
			this.channelBans = this.channelBans.splice(i, 1);
			hit = true;
			break;
		}
	}

	if (!hit)
		return false;

	Postgres.query('DELETE FROM command_banned_cmember WHERE "UID" = ' + this.uid + ' AND "CHANNEL" = ' + DBot.GetChannelID(channel));

	return true;
});

DBot.RegisterMemberMethod('muteChannel', function(channel) {
	let uid = DBot.GetChannelID(channel);

	if (this.channelBans.includes(uid))
		return false;

	Postgres.query('INSERT INTO command_banned_cmember VALUES (' + this.uid + ', ' + uid + ')');
	this.channelBans.push(uid);

	return true;
});

hook.Add('MembersFetched', 'MemberCommandBans', function(members, server, oldHashMap, collection) {
	if (collection === 0) return;
	const join = collection.joinUID();
	
	Postgres.query('SELECT command_banned_cmember."UID", command_banned_cmember."CHANNEL" FROM command_banned_cmember WHERE command_banned_cmember."UID" IN (' + join + ')', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			let get = DBot.GetMember(row.UID);
			if (!get) continue;
			DBot.IMember(get).channelBans.push(Number(row.CHANNEL));
		}
	});
	
	Postgres.query('SELECT command_banned_member."UID" FROM command_banned_member WHERE command_banned_member."UID" IN (' + join + ')', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			let get = DBot.GetMember(row.UID);
			if (!get) continue;
			DBot.IMember(get).totalMute = true;
		}
	});
	
	Postgres.query('SELECT command_bans_member."UID", command_bans_member."COMMAND" FROM command_bans_member WHERE command_bans_member."UID" IN (' + join + ')', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			if (!DBot.GetMember(row.UID)) continue;
			
			cache.member[row.UID] = cache.member[row.UID] || new CommandBanClass(DBot.GetMember(row.UID), 'member', DBot.GetMemberID);
			cache.member[row.UID].ready = true;
			cache.member[row.UID].rawban(row.COMMAND);
		}
	});
});

hook.Add('MultiMembersInitialized', 'MemberCommandBans', function(collection) {
	if (collection === 0) return;
	const join = collection.joinUID();
	
	Postgres.query('SELECT command_banned_cmember."UID", command_banned_cmember."CHANNEL" FROM command_banned_cmember WHERE command_banned_cmember."UID" IN (' + join + ')', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			let get = DBot.GetMember(row.UID);
			if (!get) continue;
			DBot.IMember(get).channelBans.push(Number(row.CHANNEL));
		}
	});
	
	Postgres.query('SELECT command_banned_member."UID" FROM command_banned_member WHERE command_banned_member."UID" IN (' + join + ')', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			let get = DBot.GetMember(row.UID);
			if (!get) continue;
			DBot.IMember(get).totalMute = true;
		}
	});
	
	Postgres.query('SELECT command_bans_member."UID", command_bans_member."COMMAND" FROM command_bans_member WHERE command_bans_member."UID" IN (' + join + ')', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			if (!DBot.GetMember(row.UID)) continue;
			
			cache.member[row.UID] = cache.member[row.UID] || new CommandBanClass(DBot.GetMember(row.UID), 'member', DBot.GetMemberID);
			cache.member[row.UID].ready = true;
			cache.member[row.UID].rawban(row.COMMAND);
		}
	});
});

const MemberInitialized = function(obj, uid, isCascade) {
	if (!DBot.SQLReady() || isCascade) return;
	
	let myObj = DBot.IMember(obj);
	
	DBot.MemberCBans(obj);
	
	Postgres.query('SELECT * FROM command_banned_cmember WHERE "UID" = ' + obj.uid, function(err, data) {
		for (let row of data) {
			myObj.channelBans.push(Number(row.CHANNEL));
		}
	});
	
	Postgres.query('SELECT * FROM command_banned_member WHERE "UID" = ' + obj.uid, function(err, data) {
		if (data && data[0]) {
			myObj.totalMute = true;
		}
	});
};

hook.Add('MemberInitialized', 'MemberCommandBans', MemberInitialized);

hook.Add('UpdateLoadingLevel', 'MemberCommandBans', function(callFunc) {
	callFunc(true, 3);
});

hook.Add('MembersInitialized', 'MemberCommandBans', function(members) {
	Postgres.query('SELECT command_banned_cmember."UID", command_banned_cmember."CHANNEL" FROM command_banned_cmember, users WHERE users."TIME" > currtime() - 120 AND command_banned_cmember."UID" = users."ID"', function(err, data) {
		if (err) throw err;
		DBot.updateLoadingLevel(false);
		
		for (let row of data) {
			let get = DBot.GetMember(row.UID);
			
			if (!get)
				continue;
			
			DBot.IMember(get).channelBans.push(Number(row.CHANNEL));
		}
	});
	
	Postgres.query('SELECT command_banned_member."UID" FROM command_banned_member, users WHERE users."TIME" > currtime() - 120 AND command_banned_member."UID" = users."ID"', function(err, data) {
		if (err) throw err;
		DBot.updateLoadingLevel(false);
		
		for (let row of data) {
			let get = DBot.GetMember(row.UID);
			
			if (!get)
				continue;
			
			DBot.IMember(get).totalMute = true;
		}
	});
	
	Postgres.query('SELECT command_bans_member."UID", command_bans_member."COMMAND" FROM command_bans_member, users WHERE users."TIME" > currtime() - 120 AND command_bans_member."UID" = users."ID"', function(err, data) {
		if (err) throw err;
		DBot.updateLoadingLevel(false);
		
		for (let row of data) {
			if (!DBot.GetMember(row.UID))
				continue;
			
			cache.member[row.UID] = cache.member[row.UID] || new CommandBanClass(DBot.GetMember(row.UID), 'member', DBot.GetMemberID);
			cache.member[row.UID].ready = false;
			cache.member[row.UID].ban(row.COMMAND);
		}
		
		for (let i in cache.member) {
			if (cache.member[i])
				cache.member[i].ready = true;
		}
	});
});

const disallow = [
	'mute', 'unmute', 'cmute', 'cunmute'
];

hook.Add('CanExecuteValidCommand', 'MemberCommandBans', function(user, command, msg) {
	if (DBot.IsPM(msg))
		return;
	
	if (disallow.includes(command))
		return;
	
	let member = msg.member;
	let obj = DBot.IMember(msg.member);
	let cid = DBot.GetChannelID(msg.channel);
	
	if (obj.totalMute)
		return false;
	
	if (!obj.channelBans) {
		MemberInitialized(member, member.uid, false);
		console.error('Member ' + member.user.username + ' on server ' + member.guild.name + ' has missing methods');
	}
	
	if (obj.channelBans.includes(cid))
		return false;
});

hook.Add('CanReply', 'MemberCommandBans', function(msg) {
	if (DBot.IsPM(msg))
		return;
	
	let member = msg.member;
	let obj = DBot.IMember(msg.member);
	let cid = DBot.GetChannelID(msg.channel);
	
	if (obj.totalMute)
		return false;
	
	if (!obj.channelBans) {
		MemberInitialized(member, member.uid, false);
		console.error('Member ' + member.user.username + ' on server ' + member.guild.name + ' has missing methods');
	}
	
	if (obj.channelBans.includes(cid))
		return false;
});

hook.Add('ClientLeftServer', 'MemberCommandBans', function(member) {
	if (!member.uid) return;
	cache.member[member.uid] = undefined;
});
