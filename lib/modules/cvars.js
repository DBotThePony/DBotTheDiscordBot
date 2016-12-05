
var utf8 = require('utf8');

// Users can't grab convar value
// Always printed in PM
FCVAR_PROTECTED 			= 1;
FCVAR_PRIVATE	 			= 1;
FCVAR_PRINTABLEONLY 		= 2;
FCVAR_NUMERSONLY 			= 3;
FCVAR_CHANNELONLY			= 4;
FCVAR_USERONLY 				= 5;
FCVAR_SERVERONLY 			= 6; // No use?
FCVAR_BOOLONLY 				= 7;
FCVAR_NUMERSONLY_INT 		= 8;
FCVAR_NUMERSONLY_UINT 		= 9;
FCVAR_ONECHAR_ONLY 			= 10;
FCVAR_NOTNULL 				= 11;
FCVAR_ERROR_TOOLONG 		= 255;

cvars = {};

DBot.DefineMySQLTable('cvar_server', '`ID` INTEGER NOT NULL, `CVAR` VARCHAR(64) NOT NULL, `VALUE` VARCHAR(255) NOT NULL, PRIMARY KEY (`ID`, `CVAR`)');
DBot.DefineMySQLTable('cvar_channel', '`ID` INTEGER NOT NULL, `CVAR` VARCHAR(64) NOT NULL, `VALUE` VARCHAR(255) NOT NULL, PRIMARY KEY (`ID`, `CVAR`)');
DBot.DefineMySQLTable('cvar_client', '`ID` INTEGER NOT NULL, `CVAR` VARCHAR(64) NOT NULL, `VALUE` VARCHAR(255) NOT NULL, PRIMARY KEY (`ID`, `CVAR`)');

cvars.Strings = [];
cvars.Strings[FCVAR_PROTECTED] = 'FCVAR_PROTECTED';
cvars.Strings[FCVAR_PRINTABLEONLY] = 'FCVAR_PRINTABLEONLY';
cvars.Strings[FCVAR_NUMERSONLY] = 'FCVAR_NUMERSONLY';
cvars.Strings[FCVAR_CHANNELONLY] = 'FCVAR_CHANNELONLY';
cvars.Strings[FCVAR_USERONLY] = 'FCVAR_USERONLY';
cvars.Strings[FCVAR_SERVERONLY] = 'FCVAR_SERVERONLY';
cvars.Strings[FCVAR_BOOLONLY] = 'FCVAR_BOOLONLY';
cvars.Strings[FCVAR_NUMERSONLY_INT] = 'FCVAR_NUMERSONLY_INT';
cvars.Strings[FCVAR_NUMERSONLY_UINT] = 'FCVAR_NUMERSONLY_UINT';
cvars.Strings[FCVAR_ONECHAR_ONLY] = 'FCVAR_ONECHAR_ONLY';
cvars.Strings[FCVAR_NOTNULL] = 'FCVAR_NOTNULL';

cvars.ErrorMessages = [];
cvars.ErrorMessages[FCVAR_ERROR_TOOLONG] = 'Variable value is too long!';

cvars.ErrorMessages[FCVAR_PROTECTED] = 'Variable is protected';
cvars.ErrorMessages[FCVAR_PRINTABLEONLY] = 'Variable accepts only printable characters';
cvars.ErrorMessages[FCVAR_NUMERSONLY] = 'Variable accepts only numers';
cvars.ErrorMessages[FCVAR_CHANNELONLY] = 'Variable accepts only valid server channels or empty channel ("")';
cvars.ErrorMessages[FCVAR_USERONLY] = 'Variable accepts only valid users or null ("")';
cvars.ErrorMessages[FCVAR_SERVERONLY] = 'Variable accepts only servers or null ("")';
cvars.ErrorMessages[FCVAR_BOOLONLY] = 'Variable accepts only booleans';
cvars.ErrorMessages[FCVAR_NUMERSONLY_INT] = 'Variable accepts only integer values';
cvars.ErrorMessages[FCVAR_NUMERSONLY_UINT] = 'Variable accepts only unsigned integer values';
cvars.ErrorMessages[FCVAR_ONECHAR_ONLY] = 'Variable accepts only one symbol';
cvars.ErrorMessages[FCVAR_NOTNULL] = 'Variable accepts not null values';

cvars.CONVARS_SERVER = {};
cvars.CONVARS_CHANNEL = {};
cvars.CONVARS_USER = {};

cvars.CONVARS_SERVER_CALLBACKS = {};
cvars.CONVARS_CHANNEL_CALLBACKS = {};
cvars.CONVARS_USER_CALLBACKS = {};

cvars.SERVERS = {};
cvars.CHANNELS = {};
cvars.CLIENTS = {};

class ConVar {
	constructor(data, object) {
		this.data = data;
		this.idFunc = data.idFunc;
		this.realm = data.realm;
		this.description = data.description;
		this.desc = data.description;
		this.defValue = data.val;
		this.flags = data.flags;
		
		this.callbacks = {};
		this.obj = object;
		this.id = this.idFunc(object);
		
		this.NAME = data.id;
		this.name = data.id;
		this.cvar = data.id;
		
		var me = this;
		
		this.value = this.defValue;
		
		MySQL.query('SELECT `VALUE` FROM `cvar_' + this.realm + '` WHERE `ID` = ' + this.id + ' AND `CVAR` = "' + this.name + '"', function(err, data) {
			if (!data || !data[0]) {
				MySQL.query('INSERT INTO `cvar_' + me.realm + '` (`ID`, `CVAR`, `VALUE`) VALUES (' + me.id + ', "' + me.name + '", ' + MySQL.escape(utf8.encode(me.defValue)) + ')');
			} else {
				me.value = utf8.decode(data[0].VALUE);
			}
		});
	}
	
	haveFlag(flag) {
		for (let flagZ of this.flags) {
			if (flagZ == flag)
				return true;
		}
		
		return false;
	}
	
	hasFlag(flag) {
		return this.haveFlag(flag);
	}
	
	getSession() {
		return this.session;
	}
	
	setValue(val) {
		if (typeof val != 'string')
			throw new TypeError('Value must be a string');
		
		if (val.length > 200)
			return [false, FCVAR_ERROR_TOOLONG];
		
		for (let flag of this.flags) {
			if (flag == FCVAR_PRINTABLEONLY) {
				if (!val.match(/^([a-zA-Zà-ÿÀ-ß0-9]+)$/))
					return [false, FCVAR_PRINTABLEONLY];
			} else if (flag == FCVAR_NUMERSONLY) {
				if (!val.match(/^([0-9]+)$/))
					return [false, FCVAR_NUMERSONLY];
				
				if (!Util.ToNumber(val))
					return [false, FCVAR_NUMERSONLY];
			} else if (flag == FCVAR_NUMERSONLY_INT) {
				if (!val.match(/^([0-9]+)$/))
					return [false, FCVAR_NUMERSONLY_INT];
				
				if (!Util.ToNumber(val))
					return [false, FCVAR_NUMERSONLY_INT];
				
				val = String(Math.floor(Util.ToNumber(val)));
			} else if (flag == FCVAR_NUMERSONLY_UINT) {
				if (!val.match(/^([0-9]+)$/))
					return [false, FCVAR_NUMERSONLY_UINT];
				
				let num = Util.ToNumber(val);
				if (!num || num < 0)
					return [false, FCVAR_NUMERSONLY_UINT];
				
				val = String(Math.floor(num));
			} else if (flag == FCVAR_CHANNELONLY) {
				if (val == '')
					continue;
				
				let channelID2 = Util.ToNumber(val);
				
				if (channelID2) {
					let find = DBot.FindChannel(channelID2);
					if (!find)
						return [false, FCVAR_CHANNELONLY];
					
					val = DBot.GetChannelID(find);
					continue;
				}
				
				if (!val.match(/^<#([0-9]+)>$/))
					return [false, FCVAR_CHANNELONLY];
				
				let channelID = val.substr(2, val.length - 3);
				let find = DBot.FindChannel(channelID);
				if (!find)
					return [false, FCVAR_CHANNELONLY];
				
				val = DBot.GetChannelID(find);
			} else if (flag == FCVAR_BOOLONLY) {
				if (val != '1' && val != '0' && val != 'true' && val != 'false')
					return [false, FCVAR_BOOLONLY];
			} else if (flag == FCVAR_ONECHAR_ONLY) {
				if (val.length != 1)
					return [false, FCVAR_ONECHAR_ONLY];
			} else if (flag == FCVAR_NOTNULL) {
				if (val.length == 0)
					return [false, FCVAR_NOTNULL];
			} else if (flag == FCVAR_USERONLY) {
				if (val == '')
					continue;
				
				let user2 = Util.ToNumber(val);
				
				if (user2) {
					let find;
					let users = DBot.client.users.array();
					
					for (let k in users) {
						if (users[k].id == user2) {
							find = users[k];
							break;
						}
					}
					
					if (!find)
						return [false, FCVAR_USERONLY];
					
					val = DBot.GetUserID(find);
					continue;
				}
				
				if (!val.match(/^<@!?([0-9]+)>$/))
					return [false, FCVAR_USERONLY];
				
				let find = DBot.IdentifyUser(val);
				
				if (!find)
					return [false, FCVAR_USERONLY];
				
				val = DBot.GetUserID(find);
			}
		}
		
		let oldVal = this.value;
		this.value = val;
		MySQL.query('UPDATE `cvar_' + this.realm + '` SET `VALUE` = ' + MySQL.escape(utf8.encode(val)) + ' WHERE `ID` = "' + this.id + '" AND `CVAR` = "' + this.name + '"');
		
		this.session.onValueChanged(this, oldVal, val);
		this.onValueChanged(oldVal, val);
		
		return [true];
	}
	
	reset() {
		this.setValue(this.defValue);
	}
	
	getString() {
		return this.value;
	}
	
	getFormatedString() {
		for (let flag of this.flags) {
			if (flag == FCVAR_BOOLONLY) {
				return this.getBool() && 'true' || 'false';
			} else if (flag == FCVAR_CHANNELONLY) {
				let find = this.getChannel();
				
				if (!find)
					return 'INVALID CHANNEL';
				else
					return '#' + find.name;
			} else if (flag == FCVAR_USERONLY) {
				let find = this.getUser();
				
				if (!find)
					return 'INVALID USER';
				else
					return '@' + find.username;
			}
		}
		
		return this.value;
	}
	
	joinFlags() {
		var concatFlags = '';
		
		for (let flag of this.flags) {
			concatFlags += ' ' + cvars.Strings[flag];
		}
		
		return concatFlags;
	}
	
	format() {
		var output = '';
		var concatFlags = this.joinFlags();
		
		output += ' "' + this.name + '" = "' + this.getFormatedString() + '"' + (this.value != this.defValue && ' (default "' + this.defValue + '")' || '');
		output += '\n  ' + concatFlags;
		output += '\n    --- ' + this.desc;
		
		return output;
	}
	
	getInt() {
		var val = Util.ToNumber(this.value) || Util.ToNumber(this.defValue);
		return Math.floor(val);
	}
	
	getFloat() {
		var val = Util.ToNumber(this.value) || Util.ToNumber(this.defValue);
		return val;
	}
	
	getBool() {
		if (this.value == '' || this.value == '0' || this.value == 'false' || this.value == 'lie')
			return false;
		
		var num = Util.ToNumber(this.value);
		
		if (num && num < 0)
			return false;
		
		return true;
	}
	
	getChannel() {
		if (this.value == '')
			return false;
		
		return DBot.GetChannel(this.value);
	}
	
	getUser() {
		if (this.value == '')
			return false;
		
		return DBot.GetUser(this.value);
	}
	
	changeCallback(fID, func) {
		this.callbacks[fID] = func;
	}
	
	onValueChanged(oldVal, newVal) {
		for (let func in this.callbacks) {
			this.callbacks[func](oldVal, newVal);
		}
	}
}

class UserVarSession {
	constructor(obj) {
		this.obj = obj;
		this.user = obj;
		this.id = obj.id;
		this.uid = DBot.GetUserID(obj);
		
		this.cvars = {};
		this.callbacks = {};
		
		for (let i in cvars.CONVARS_USER) {
			this.cvars[i] = new ConVar(cvars.CONVARS_USER[i], obj);
			this.cvars[i].session = this;
		}
	}
	
	getVar(id) {
		return this.cvars[id];
	}
	
	getVars() {
		return this.cvars;
	}
	
	changeCallback(vID, fID, func) {
		this.callbacks[vID] = this.callbacks[vID] || {};
		this.callbacks[vID][fID] = func;
	}
	
	onValueChanged(cvar, oldVal, newVal) {
		hook.Run('UserVarChanges', this, cvar, oldVal, newVal);
		
		if (!this.callbacks[cvar.cvar])
			return;
		
		for (let func in this.callbacks[cvar.cvar]) {
			this.callbacks[cvar.cvar][func](cvar, oldVal, newVal);
		}
	}
	
	cvarlist() {
		var output = '';
		
		for (let id in this.cvars) {
			let cvar = this.cvars[id];
			output += Util.AppendSpaces(id, 15) + ' = "' + Util.AppendSpaces(cvar.getFormatedString() + '"', 10) + '; ' + cvar.joinFlags() + '\n';
		}
		
		return output;
	}
}

class ServerVarSession {
	constructor(obj) {
		this.obj = obj;
		this.server = obj;
		this.guild = obj;
		this.id = obj.id;
		this.uid = DBot.GetServerID(obj);
		
		this.cvars = {};
		this.callbacks = {};
		
		for (let i in cvars.CONVARS_SERVER) {
			this.cvars[i] = new ConVar(cvars.CONVARS_SERVER[i], obj);
			this.cvars[i].session = this;
		}
	}
	
	getVar(id) {
		return this.cvars[id];
	}
	
	getVars() {
		return this.cvars;
	}
	
	changeCallback(vID, fID, func) {
		this.callbacks[vID] = this.callbacks[vID] || {};
		this.callbacks[vID][fID] = func;
	}
	
	onValueChanged(cvar, oldVal, newVal) {
		hook.Run('ServerVarChanges', this, cvar, oldVal, newVal);
		
		if (!this.callbacks[cvar.cvar])
			return;
		
		for (let func in this.callbacks[cvar.cvar]) {
			this.callbacks[cvar.cvar][func](cvar, oldVal, newVal);
		}
	}
	
	cvarlist() {
		var output = '';
		
		for (let id in this.cvars) {
			let cvar = this.cvars[id];
			output += Util.AppendSpaces(id, 15) + ' = "' + Util.AppendSpaces((!cvar.haveFlag(FCVAR_PROTECTED) && (cvar.getFormatedString() || 'NULL') || '[REDACTED]') + '"', 10) + '; ' + cvar.joinFlags() + '\n';
		}
		
		return output;
	}
}

class ChannelVarSession {
	constructor(obj) {
		this.obj = obj;
		this.channel = obj;
		this.id = obj.id;
		this.uid = DBot.GetChannelID(obj);
		
		this.cvars = {};
		this.callbacks = {};
		
		for (let i in cvars.CONVARS_CHANNEL) {
			this.cvars[i] = new ConVar(cvars.CONVARS_CHANNEL[i], obj);
			this.cvars[i].session = this;
		}
	}
	
	getVar(id) {
		return this.cvars[id];
	}
	
	getVars() {
		return this.cvars;
	}
	
	changeCallback(vID, fID, func) {
		this.callbacks[vID] = this.callbacks[vID] || {};
		this.callbacks[vID][fID] = func;
	}
	
	onValueChanged(cvar, oldVal, newVal) {
		hook.Run('ChannelVarChanges', this, cvar, oldVal, newVal);
		
		if (!this.callbacks[cvar.cvar])
			return;
		
		for (let func in this.callbacks[cvar.cvar]) {
			this.callbacks[cvar.cvar][func](cvar, oldVal, newVal);
		}
	}
	
	cvarlist() {
		var output = '';
		
		for (let id in this.cvars) {
			let cvar = this.cvars[id];
			output += Util.AppendSpaces(id, 15) + ' = "' + Util.AppendSpaces((!cvar.haveFlag(FCVAR_PROTECTED) && (cvar.getFormatedString() || 'NULL') || '[REDACTED]') + '"', 10) + '; ' + cvar.joinFlags() + '\n';
		}
		
		return output;
	}
}

hook.Add('UserInitialized', 'CVars', function(obj) {
	if (cvars.CLIENTS[DBot.GetUserID(obj)])
		return;
	
	cvars.CLIENTS[DBot.GetUserID(obj)] = new UserVarSession(obj);
});

hook.Add('ChannelInitialized', 'CVars', function(obj) {
	if (cvars.CHANNELS[DBot.GetChannelID(obj)])
		return;
	
	cvars.CHANNELS[DBot.GetChannelID(obj)] = new ChannelVarSession(obj);
});

hook.Add('ServerInitialized', 'CVars', function(obj) {
	if (cvars.SERVERS[DBot.GetServerID(obj)])
		return;
	
	cvars.SERVERS[DBot.GetServerID(obj)] = new ServerVarSession(obj);
});

cvars.Server = function(server) {
	return cvars.SERVERS[DBot.GetServerID(server)];
}

cvars.Channel = function(channel) {
	return cvars.CHANNELS[DBot.GetChannelID(channel)];
}

cvars.Client = function(user) {
	return cvars.CLIENTS[DBot.GetUserID(user)];
}

cvars.User = cvars.Client;

cvars.ServerVar = function(cvar, defaultValue, flags, description) {
	flags = flags || [];
	description = description || '';
	
	cvars.CONVARS_SERVER[cvar] = {
		flags: flags,
		description: description,
		val: String(defaultValue),
		idFunc: DBot.GetServerID,
		realm: 'server',
		id: cvar,
	}
	
	return cvars.CONVARS_SERVER[cvar];
}

cvars.ClientVar = function(cvar, defaultValue, flags, description) {
	flags = flags || [];
	description = description || '';
	
	cvars.CONVARS_USER[cvar] = {
		flags: flags,
		description: description,
		val: String(defaultValue),
		idFunc: DBot.GetClientID,
		realm: 'client',
		id: cvar,
	}
	
	return cvars.CONVARS_USER[cvar];
}

cvars.ChannelVar = function(cvar, defaultValue, flags, description) {
	flags = flags || [];
	description = description || '';
	
	cvars.CONVARS_CHANNEL[cvar] = {
		flags: flags,
		description: description,
		val: String(defaultValue),
		idFunc: DBot.GetChannelID,
		realm: 'channel',
		id: cvar,
	}
	
	return cvars.CONVARS_CHANNEL[cvar];
}

