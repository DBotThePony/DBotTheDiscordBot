
var mysql = require('mysql');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'discord_bot',
	password : '',
	database : 'discord_bot'
});

connection.connect();

DBot.MySQL = connection;

DBot.Query = function(str, callback) {
	DBot.MySQL.query(str, callback);
}

DBot.query = function(str, callback) {
	DBot.MySQL.query(str, callback);
}

DBot.MySQLTables = {};

DBot.DefineMySQLTable = function(tab, contents) {
	DBot.MySQLTables[tab] = contents;
	DBot.query('CREATE TABLE IF NOT EXISTS `' + tab + '` (' + contents + ')');
}
