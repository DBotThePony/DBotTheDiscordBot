
DBot.tags = {};
DBot.tagCache = {};
var cache = DBot.tagCache;
var MySQL = DBot.MySQL;

DBot.CreateTagsSpace = function(space, defBans = []) {
	DBot.tags[space] = {
		bans: defBans,
		name: space,
	}
	
	DBot.tagCache[space] = {};
	
	DBot.DefineMySQLTable('tags__' + space + '_client_init', 'UID INTEGER NOT NULL');
	DBot.DefineMySQLTable('tags__' + space + '_client', 'UID INTEGER NOT NULL, TAG VARACHAR(64) NOT NULL');
	
	DBot.DefineMySQLTable('tags__' + space + '_server_init', 'UID INTEGER NOT NULL');
	DBot.DefineMySQLTable('tags__' + space + '_server', 'UID INTEGER NOT NULL, TAG VARACHAR(64) NOT NULL');
	
	DBot.DefineMySQLTable('tags__' + space + '_channel_init', 'UID INTEGER NOT NULL');
	DBot.DefineMySQLTable('tags__' + space + '_channel', 'UID INTEGER NOT NULL, TAG VARACHAR(64) NOT NULL');
}

class TagBase {
	constructor(obj, space, realm, IDFunc) {
		this.bans = [];
		this.obj = obj;
		this.realm = realm;
		this.ready = false;
		this.uid = IDFunc(user);
		
		MySQL.query('SELECT UID FROM tags__' + space + '_' + this.realm + '_init WHERE UID = ' + this.uid, function(err, data) {
			if (!data[0]) {
				this.ready = true;
				var bans = DBot.tags.bans;
				
				for (var i in bans) {
					this.banTag(bans[i]);
				}
				
				hook.Run('UserTagsInitialized', user, space, this);
				MySQL.query('INSERT INTO tags__' + space + '_' + this.realm + '_init (UID) VALUES (' + this.uid + ')');
			} else {
				MySQL.query('SELECT TAG FROM tags__' + space + '_' + this.realm + ' WHERE UID = ' + this.uid, function(err, data) {
					for (var i in data) {
						if (typeof(v) != 'number')
							continue;
						
						this.banTag(data[i].TAG);
					}
					
					this.ready = true;
					hook.Run('UserTagsInitialized', user, space, this);
				});
			}
		});
	}
	
	onBanned(tag) {
		if (!this.ready)
			return;
		
		MySQL.query('INSERT INTO tags__' + space + '_' + this.realm + ' (UID, TAG) VALUES (' + this.uid + ', "' + tag + '")');
	}
	
	onUnBanned(tag) {
		if (!this.ready)
			return;
		
		MySQL.query('REMOVE FROM tags__' + space + '_' + this.realm + ' WHERE UID = ' + this.uid + ' AND TAG = "' + tag + '"');
	}
	
	set addTag(tag) {
		if (DBot.HaveValue(this.bans))
			return false;
		
		this.bans.push(tag);
		onBanned(tag);
		return true;
	}
	
	set banTag(tag) {
		return this.addTag(tag);
	}
	
	set removeTag(tag) {
		for (var i in this.bans) {
			if (this.bans[i] == tag) {
				this.bans.splice(i, 1);
				onUnBanned(tag);
				return true;
			}
		}
		
		return false;
	}
	
	set deleteTag(tag) {
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
}

DBot.UserTags = function(user, space) {
	if (cache[space][user.id])
		return cache[space][user.id];
	
	cache[space][user.id] = new TagBase(user, space, 'client', DBot.GetUserID);
	return cache[space][user.id];
}

DBot.ServerTags = function(server, space) {
	if (cache[space][server.id])
		return cache[space][server.id];
	
	cache[space][server.id] = new TagBase(server, space, 'server', DBot.GetServerID);
	return cache[space][server.id];
}

DBot.ChannelTags = function(channel, space) {
	if (cache[space][channel.id])
		return cache[space][channel.id];
	
	cache[space][channel.id] = new TagBase(channel, space, 'channel', DBot.GetChannelID);
	return cache[space][channel.id];
}
