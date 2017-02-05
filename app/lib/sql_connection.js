
/* global DBot, Symbol, hook */

const pg = require('pg');
const fs = DBot.js.fs;

const pgConfig = {
	user: DBot.cfg.sql_user,
	database: DBot.cfg.sql_database,
	password: DBot.cfg.sql_password,
	host: DBot.cfg.sql_hostname,
	port: DBot.cfg.sql_port
};

const pgConnection = new pg.Client(pgConfig);

MySQL = pgConnection;
MySQLM = pgConnection;

DBot.MySQL = MySQL;
DBot.MySQLM = MySQLM;

PG = pgConnection;
Postgre = pgConnection;
Postgres = pgConnection;
DBot.PG = pgConnection;
DBot.Postgre = pgConnection;
DBot.Postgres = pgConnection;

const sqlPg = fs.readFileSync('./app/postgres.sql', 'utf8').replace(/\r/gi, '');

pgConnection.oldQuery = pgConnection.query;

pgConnection.query = function(query, callback) {
	let oldStack = new Error().stack;
	
	// if (query.length < 100) console.log(query); // To trackdown small queries on startup
	
	pgConnection.oldQuery(query, function(err, data) {
		let newErrorMessage;
		
		if (err) {
			newErrorMessage = 'QUERY: ' + (err.internalQuery || query) + '\nERROR: ' + err.message;
			
			if (err.hint)
				newErrorMessage += '\nHINT: ' + err.hint;
			
			if (err.detail)
				newErrorMessage += '\n' + err.hint;
			
			newErrorMessage += '\n' + oldStack;
			err.stack = newErrorMessage;
			
			if (!callback) throw err;
		}
		
		if (callback) {
			try {
				let obj = {};
				let cID = 0;
				let amountOfRows = 0;
				
				if (data) {
					amountOfRows = data.rows.length;
					
					for (let row of data.rows) {
						obj[cID] = row;
						cID++;
					}
				}
				
				obj[Symbol.iterator] = function* () {
					for (let i = 0; i < amountOfRows; i++) {
						yield data.rows[i];
					}
				};
				
				callback(err, obj, data);
			} catch(newErr) {
				let e = new Error(newErr);
				e.stack = newErr.stack + '\n ------- \n' + oldStack.substr(6);
				throw e; // Rethrow
			}
		}
	});
};

pgConnection.connect(function(err) {
	if (err) throw err;
	
	pgConnection.query(sqlPg, function(err) {
		if (err) throw err;
		
		let db_rev = 0;
		let last_rev = DBot.fs.readdirSync('./app/dbrevisions/').length;
		
		pgConnection.query('SELECT "VALUE" FROM db_info WHERE "KEY" = \'version\'', function(err, data) {
			if (err) throw err;
			if (data[0])
				db_rev = Number(data[0].VALUE);
			else
				pgConnection.query('INSERT INTO db_info VALUES (\'version\', \'' + last_rev + '\')');
			
			if (db_rev >= last_rev)
				hook.Run('SQLInitialize');
			else {
				console.log('Upgrading database, please wait...');
				
				let callbackFuncs = [];
				let current = 0;
				
				let usualCallback = function(err) {
					if (err) {
						console.error('There is a problem with upgrading database');
						throw err;
					}
					
					current++;
					if (!callbackFuncs[current])
						return;
					
					callbackFuncs[current]();
				};
				
				for (let i = db_rev + 1; i <= last_rev; i++) {
					callbackFuncs.push(function(err) {
						console.log((i - 1) + '->' + i);
						let contents = DBot.fs.readFileSync('./app/dbrevisions/' + i + '.sql', 'utf8');
						pgConnection.query(contents, usualCallback);
					});
				}
				
				callbackFuncs.push(function() {
					pgConnection.query('UPDATE db_info SET "VALUE" = \'' + last_rev + '\' WHERE "KEY" = \'version\';', function() {
						console.log('Upgrade complete.');
						hook.Run('SQLInitialize');
					});
				});
				
				callbackFuncs[0]();
			}
		});
	});
});

