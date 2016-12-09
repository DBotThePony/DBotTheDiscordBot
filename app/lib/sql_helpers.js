
sql = {};
DBot.sql = sql;

sql.query = function(str, callback) {
	return MySQL.query(str, callback);
}

sql.Member = function(obj) {
	return 'get_member_id(\'' + obj.user.id + '\', \'' + obj.guild.id + '\')';
}

sql.UMember = function(obj, obj2) {
	return 'get_member_id(\'' + obj.id + '\', \'' + obj2.id + '\')';
}

sql.User = function(obj) {
	return 'get_user_id(\'' + obj.id + '\')';
}

sql.Channel = function(obj) {
	return 'get_channel_id(\'' + obj.id + '\', ' + sql.Server(obj.guild) + ')';
}

sql.Server = function(obj) {
	return 'get_server_id(\'' + obj.id + '\')';
}

sql.Role = function(obj) {
	return 'get_role_id_combined(\'' + obj.id + '\', \'' + obj.guild.id + '\')';
}

sql.escape = Util.escape

let concatNames = function(tab) {
	return '"' + tab.join('", "') + '"';
}

let concatValues = function(tab) {
	let output = [];
	
	for (let v of tab) {
		output.push(Util.escape(v));
	}
	
	return output.join(', ');
}

// Functions from DMySQL
sql.Insert = function(tab, keys) {
	let vals = [];
	
	for (let i = 2; i < arguments.length; i++) {
		vals.push('(' + concatValues(arguments[i]) + ')');
	}
	
	return 'INSERT INTO ' + tab + ' (' + concatNames(keys) + ') VALUES ' + vals.join(', ');
}

sql.Replace = function(tab, keys) {
	let vals = [];
	
	for (let i = 2; i < arguments.length; i++) {
		vals.push('(' + concatValues(arguments[i]) + ')');
	}
	
	return 'REPLACE INTO ' + tab + ' (' + concatNames(keys) + ') VALUES ' + vals.join(', ');
}

sql.Array = function(arr) {
	let output = 'ARRAY [';
	let first = true;
	
	for (let obj of arr) {
		if (first) {
			first = false;
			output += Util.escape(obj);
		} else {
			output += ',' + Util.escape(obj);
		}
	}
	
	return output + ']';
}

sql.Concat = function() {
	let output = '';
	let first = true;
	
	for (let obj of arguments) {
		if (first) {
			first = false;
			output += Util.escape(obj);
		} else {
			output += ',' + Util.escape(obj);
		}
	}
	
	return output;
}
