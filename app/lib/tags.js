
DBot.tags = {};
DBot.tagCache = {};
let cache = DBot.tagCache;

cache.server = {};
cache.client = {};
cache.channel = {};

let finalInitQuery = '';

DBot.CreateTagsSpace = function(space, defBans) {
	DBot.tags[space] = {
		bans: defBans || [],
		name: space,
	}
	
	DBot.tagCache.server[space] = {};
	DBot.tagCache.client[space] = {};
	DBot.tagCache.channel[space] = {};
	let b = sql.Array(defBans);
	
	Postgre.query('INSERT INTO tags_defbans VALUES (' + Util.escape(space) + ', ' + b + ') ON CONFLICT ("SPACE") DO UPDATE SET "TAG" = ' + b);
}

class TagBase {
	onBanned(tag) {
		if (!this.ready)
			return;
		
		this.update();
	}
	
	update() {
		let b = sql.Array(this.bans);
		
		Postgre.query('UPDATE tags_list SET "TAG" = ' + b + ' WHERE "SPACE" = ' + Util.escape(this.space) + ' AND "REALM" = ' + Util.escape(this.realm) + ' AND "UID" = ' + this.uid);
	}
	
	onUnBanned(tag) {
		if (!this.ready)
			return;
		
		this.update();
	}
	
	addTag(tag) {
		if (DBot.HaveValue(this.bans, tag))
			return false;
		
		this.bans.push(tag);
		this.onBanned(tag);
		return true;
	}
	
	banTag(tag) {
		return this.addTag(tag);
	}
	
	removeTag(tag) {
		for (let i in this.bans) {
			if (this.bans[i] == tag) {
				this.bans.splice(i, 1);
				this.onUnBanned(tag);
				return true;
			}
		}
		
		return false;
	}
	
	deleteTag(tag) {
		return this.removeTag(tag);
	}
	
	unBanTag(tag) {
		return this.removeTag(tag);
	}
	
	unBan(tag) {
		return this.removeTag(tag);
	}
	
	isBanned(tag) {
		return DBot.HaveValue(this.bans, tag.toLowerCase());
	}
	
	bannedTags() {
		return this.bans;
	}
	
	getBannedTags() {
		return this.bans;
	}
	
	reset() {
		this.ready = false;
		this.bans = [];
		
		for (let b of this.defBans) {
			this.banTag(b);
		}
		
		this.ready = true;
		this.update();
	}
	
	simulateSelect(data) {
		this.ready = false;
		
		for (let i in data) {
			this.banTag(data[i].TAG);
		}
		
		this.ready = true;
		hook.Run('TagsInitialized', this.realm, this.obj, this.space, this);
	}
	
	constructor(obj, space, realm, IDFunc, noInitChecks, noSelect) {
		this.bans = [];
		this.obj = obj;
		this.realm = realm;
		this.ready = false;
		this.uid = IDFunc(obj);
		this.space = space;
		
		this.defBans = DBot.tags[this.space].bans;
		
		if (noSelect)
			return;
		
		let self = this;
		
		if (!noInitChecks) {
			let query = 'INSERT INTO tags_list VALUES (\'' + this.uid + '\', \'' + this.realm + '\', \'' + this.space + '\', ARRAY []::VARCHAR(128)[]) ON CONFLICT DO NOTHING; SELECT "UID" FROM tags_init WHERE "UID" = \'' + this.uid + '\' AND "REALM" = \'' + this.realm + '\' AND "SPACE" = \'' + this.space + '\'';
			
			Postgres.query(query, function(err, data) {
				if (err)
					throw err;
				
				if (!data[0]) {
					for (let b of self.defBans) {
						self.banTag(b);
					}
					
					self.ready = true;
					self.update();
					
					hook.Run('TagsInitialized', self.realm, obj, self.space, self);
					Postgres.query('INSERT INTO tags_init VALUES (\'' + self.uid + '\', \'' + self.realm + '\', \'' + self.space + '\')');
				} else {
					Postgres.query('SELECT UNNEST("TAG") AS "TAG" FROM tags_list WHERE "UID" = \'' + self.uid + '\' AND "REALM" = \'' + self.realm + '\' AND "SPACE" = \'' + self.space + '\'', function(err, data) {
						if (err)
							throw err;
						
						for (let row of data) {
							self.banTag(row.TAG);
						}
						
						self.ready = true;
						hook.Run('TagsInitialized', self.realm, obj, self.space, self);
					});
				}
			});
		} else {
			Postgres.query('SELECT UNNEST("TAG") AS "TAG" FROM tags_list WHERE "UID" = \'' + self.uid + '\' AND "REALM" = \'' + self.realm + '\' AND "SPACE" = \'' + self.space + '\'', function(err, data) {
				if (err)
					throw err;
				
				for (let row of data) {
					self.banTag(row.TAG);
				}
				
				self.ready = true;
				hook.Run('TagsInitialized', self.realm, obj, self.space, self);
			});
		}
	}
}

DBot.UserTags = function(user, space) {
	if (cache.client[space][user.uid])
		return cache.client[space][user.uid];
	
	cache.client[space][user.uid] = new TagBase(user, space, 'client', DBot.GetUserID);
	return cache.client[space][user.uid];
}

DBot.ServerTags = function(server, space) {
	if (cache.server[space][server.uid])
		return cache.server[space][server.uid];
	
	cache.server[space][server.uid] = new TagBase(server, space, 'server', DBot.GetServerID);
	return cache.server[space][server.uid];
}

DBot.ChannelTags = function(channel, space) {
	if (cache.channel[space][channel.uid])
		return cache.channel[space][channel.uid];
	
	cache.channel[space][channel.id] = new TagBase(channel, space, 'channel', DBot.GetChannelID);
	return cache.channel[space][channel.uid];
}

DBot.ValidTagSpaces = function() {
	let output;
	
	for (let k in DBot.tags) {
		if (output)
			output += ', ' + k;
		else
			output = String(k);
	}
	
	return output;
}

DBot.UnloadUserTags = function(user, space) {
	cache.client[space][user.uid] = undefined;
}

DBot.UnloadServerTags = function(server, space) {
	cache.server[space][server.uid] = undefined;
}

DBot.UnloadChannelTags = function(channel, space) {
	cache.channel[space][channel.uid] = undefined;
}

hook.Add('PreDeleteUser', 'UserTags', function(obj) {
	for (let i in DBot.tags) {
		DBot.UnloadUserTags(obj, i);
	}
});

hook.Add('PreDeleteChannel', 'ChannelTags', function(obj) {
	for (let i in DBot.tags) {
		DBot.UnloadChannelTags(obj, i);
	}
});

hook.Add('PreDeleteServer', 'ServerTags', function(obj) {
	for (let i in DBot.tags) {
		DBot.UnloadServerTags(obj, i);
	}
});

hook.Add('UserInitialized', 'UserTags', function(obj) {
	if (!DBot.SQLReady()) return;
	
	for (let i in DBot.tags) {
		DBot.UserTags(obj, i);
	}
});

hook.Add('UpdateLoadingLevel', 'UserTags', function(callFunc) {
	callFunc(true, 3);
});

hook.Add('UsersInitialized', 'UserTags', function() {
	let callbackFunc = function(err, data) {
		if (err) {
			console.error(err);
			Postgre.query('SELECT init_tags();', callbackFunc);
			return;
		};
		
		let q = 'SELECT tags_list."UID", tags_list."SPACE", UNNEST("TAG") AS "TAG" FROM tags_list, users WHERE tags_list."REALM" = \'client\' AND users."TIME" > currtime() - 120 AND users."ID" = tags_list."UID"';
		
		Postgre.query(q, function(err, data) {
			if (err) throw err;
			DBot.updateLoadingLevel(false);
			
			let spaces = {};
			
			for (let row of data) {
				if (!DBot.GetUser(row.UID))
					continue; // wtf
				
				cache.client[row.SPACE][row.UID] = cache.client[row.SPACE][row.UID] || new TagBase(DBot.GetUser(row.UID), row.SPACE, 'client', DBot.GetUserID, true, true);
				
				cache.client[row.SPACE][row.UID].ready = false;
				cache.client[row.SPACE][row.UID].banTag(row.TAG);
				
				spaces[row.SPACE] = true;
			}
			
			for (let s in spaces) {
				if (cache.client[s])
					for (let sp in cache.client[s]) {
						if (cache.client[s][sp])
							cache.client[s][sp].ready = true;
					}
			}
		});
	}
	
	Postgre.query('SELECT init_tags();', callbackFunc);
});

hook.Add('ServerInitialized', 'ServerTags', function(obj) {
	if (!DBot.SQLReady()) return;
	
	for (let i in DBot.tags) {
		DBot.ServerTags(obj, i);
	}
});

hook.Add('ServersInitialized', 'UserTags', function() {
	let callbackFunc = function(err, data) {
		if (err) {
			console.error(err);
			Postgre.query('SELECT init_tags_servers();', callbackFunc);
			return;
		};
		
		let q = 'SELECT tags_list."UID", tags_list."SPACE", UNNEST("TAG") AS "TAG" FROM tags_list, servers WHERE tags_list."REALM" = \'server\' AND servers."TIME" > currtime() - 120 AND servers."ID" = tags_list."UID"';
		
		Postgre.query(q, function(err, data) {
			if (err) throw err;
			DBot.updateLoadingLevel(false);
			
			let spaces = {};
			
			for (let row of data) {
				if (!DBot.GetServer(row.UID))
					continue; // wtf
				
				cache.server[row.SPACE][row.UID] = cache.server[row.SPACE][row.UID] || new TagBase(DBot.GetServer(row.UID), row.SPACE, 'server', DBot.GetServerID, true, true);
				
				cache.server[row.SPACE][row.UID].ready = false;
				cache.server[row.SPACE][row.UID].banTag(row.TAG);
				
				spaces[row.SPACE] = true;
			}
			
			for (let s in spaces) {
				if (cache.server[s])
					for (let sp in cache.server[s]) {
						if (cache.server[s][sp])
							cache.server[s][sp].ready = true;
					}
			}
		});
	}
	
	Postgre.query('SELECT init_tags_servers();', callbackFunc);
});

hook.Add('ChannelInitialized', 'ChannelTags', function(obj) {
	if (!DBot.SQLReady()) return;
	
	for (let i in DBot.tags) {
		DBot.ChannelTags(obj, i);
	}
});

hook.Add('ChannelsInitialized', 'UserTags', function() {
	let callbackFunc = function(err, data) {
		if (err) {
			console.error(err);
			Postgre.query('SELECT init_tags_channels();', callbackFunc);
			return;
		};
		
		let q = 'SELECT tags_list."UID", tags_list."SPACE", UNNEST("TAG") AS "TAG" FROM tags_list, channels WHERE tags_list."REALM" = \'channel\' AND channels."TIME" > currtime() - 120 AND channels."ID" = tags_list."UID"';
		
		Postgre.query(q, function(err, data) {
			if (err) throw err;
			DBot.updateLoadingLevel(false);
			
			let spaces = {};
			
			for (let row of data) {
				if (!DBot.GetChannel(row.UID))
					continue; // wtf
				
				cache.channel[row.SPACE][row.UID] = cache.channel[row.SPACE][row.UID] || new TagBase(DBot.GetChannel(row.UID), row.SPACE, 'channel', DBot.GetChannelID, true, true);
				
				cache.channel[row.SPACE][row.UID].ready = false;
				cache.channel[row.SPACE][row.UID].banTag(row.TAG);
				
				spaces[row.SPACE] = true;
			}
			
			for (let s in spaces) {
				if (cache.channel[s])
					for (let sp in cache.channel[s]) {
						if (cache.channel[s][sp])
							cache.channel[s][sp].ready = true;
					}
			}
		});
	};
	
	Postgre.query('SELECT init_tags_channels();', callbackFunc);
});
