
// Users can't grab convar value
// Always printed in PM
FCVAR_PROTECTED 			= 1;
FCVAR_PRINTABLEONLY 		= 2;
FCVAR_NUMERSONLY 			= 3;
FCVAR_CHANNELONLY			= 4;
FCVAR_USERONLY 				= 5;
FCVAR_SERVERONLY 			= 6; // No use?
FCVAR_BOOLONLY 				= 7;
FCVAR_NUMERSONLY_INT 		= 8;
FCVAR_NUMERSONLY_UINT 		= 9;
FCVAR_ONECHAR_ONLY 			= 10;

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
				MySQL.query('INTSER INTO `cvar_' + me.realm + '` VALUES (' + me.id + ', "' + me.name + '", ' + MySQL.escape(me.defValue) + ')');
			} else {
				me.value = data[0].VALUE;
			}
		});
	}
	
	haveFlag(flag) {
		for (let i in this.flags) {
			if (this.flags[i] == flag)
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
		
		for (let i in this.flags) {
			var flag = this.flags[i];
			
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
				
				var num = Util.ToNumber(val);
				if (!num || num < 0)
					return [false, FCVAR_NUMERSONLY_UINT];
				
				val = String(Math.floor(num));
			} else if (flag == FCVAR_CHANNELONLY) {
				if (!val.match(/^<#([0-9]+)>$/))
					return [false, FCVAR_CHANNELONLY];
				
				var channelID = val.substr(2, val.length - 3);
				if (!DBot.FindChannel(channelID))
					return [false, FCVAR_CHANNELONLY];
				
				val = DBot.GetChannelID(channelID);
			} else if (flag == FCVAR_BOOLONLY) {
				if (val != '1' && val != '0' && val != 'true' && val != 'false')
					return [false, FCVAR_BOOLONLY];
			} else if (flag == FCVAR_ONECHAR_ONLY) {
				if (val.length != 1)
					return [false, FCVAR_ONECHAR_ONLY];
			}
		}
		
		let oldVal = this.value;
		this.value = val;
		MySQL.query('UPDATE `cvar_' + this.realm + '` SET `VALUE` = ' + MySQL.escape(val) + ' WHERE `ID` = ' + this.id + ' AND `CVAR` = ' + this.name);
		
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
		for (let i in this.flags) {
			var flag = this.flags[i];
			
			if (flag == FCVAR_BOOLONLY) {
				return this.getBool() && 'true' || 'false';
			} else if (flag == FCVAR_CHANNELONLY) {
				try {
					var get = DBot.GetChannel(this.value);
					
					if (get) {
						return '<#' + get + '>';
					} else {
						return 'INVALID CHANNEL';
					}
				} catch(err) {
					return 'INVALID CHANNEL';
				}
			}
		}
		
		return this.value;
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
	
	changeCallback(vID, fID, func) {
		this.callbacks[vID] = this.callbacks[vID] || {};
		this.callbacks[vID][fID] = func;
	}
	
	onValueChanged(oldVal, newVal) {
		if (!this.callbacks[cvar])
			return;
		
		for (let i in this.callbacks[vID]) {
			this.callbacks[vID][i](oldVal, newVal);
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
		
		for (let i in this.callbacks[cvar.cvar]) {
			this.callbacks[cvar.cvar][i](cvar, oldVal, newVal);
		}
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
		
		for (let i in this.callbacks[cvar.cvar]) {
			this.callbacks[cvar.cvar][i](cvar, oldVal, newVal);
		}
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
		
		for (let i in this.callbacks[cvar.cvar]) {
			this.callbacks[cvar.cvar][i](cvar, oldVal, newVal);
		}
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

