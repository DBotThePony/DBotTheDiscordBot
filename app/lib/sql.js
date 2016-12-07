
sql = {}
DBot.sql = sql;

sql.query = function(str, callback) {
	return MySQL.query(str, callback);
}

sql.Member = function(member) {
	return 'get_member_id("' + member.user.id + '", "' + member.guild.id + '")';
}

let concatNames = function(tab) {
	return '`' + tab.join('`, `') + '`';
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
	
	return 'INSERT INTO `' + tab + '` (' + concatNames(keys) + ') VALUES ' + vals.join(', ');
}

sql.Replace = function(tab, keys) {
	let vals = [];
	
	for (let i = 2; i < arguments.length; i++) {
		vals.push('(' + concatValues(arguments[i]) + ')');
	}
	
	return 'REPLACE INTO `' + tab + '` (' + concatNames(keys) + ') VALUES ' + vals.join(', ');
}
