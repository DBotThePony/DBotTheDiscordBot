
/* global DBot, Symbol, hook */

class SQLConnectionWrapper {
	constructor(config) {
		this.counter = 0;
		this.errcounter = 0;
		this.config = config;
		config.workers = config.workers || 1;
		this.connection = new pg.Client(config);
	}
	
	query(query, callback) {
		this.counter++;
		let oldStack = new Error().stack;
		// if (query.length < 100) console.log(query); // To trackdown small queries on startup
		let self = this;

		this.connection.query(query, function(err, data) {
			let newErrorMessage;

			if (err) {
				self.errcounter++;
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
	}
	
	connect(callback) {
		let connection = this.connection;
		this.connection.connect(function(err) {
			if (!callback && err) throw err;
			if (callback) callback(err);
		});
	}
};

const pg = require('pg');
const fs = DBot.js.fs;

const pgConfig = {
	user: DBot.cfg.sql_user,
	database: DBot.cfg.sql_database,
	password: DBot.cfg.sql_password,
	host: DBot.cfg.sql_hostname,
	port: DBot.cfg.sql_port
};

const mainConnection = new SQLConnectionWrapper(pgConfig);
const secondaryConnection = new SQLConnectionWrapper(pgConfig);

Postgre = mainConnection;
Postgres = mainConnection;
DBot.Postgre = mainConnection;
DBot.Postgres = mainConnection;
DBot.secondarySQLConnection = secondaryConnection;

const sqlPg = fs.readFileSync('./app/postgres.sql', 'utf8').replace(/\r/gi, '');

mainConnection.connect(function(err) {
	if (err) throw err;
	
	mainConnection.query(sqlPg, function(err) {
		if (err) throw err;

		let db_rev = 0;
		let last_rev = DBot.js.filesystem.readdirSync('./app/dbrevisions/').length;

		mainConnection.query('SELECT "VALUE" FROM db_info WHERE "KEY" = \'version\'', function(err, data) {
			if (err) throw err;
			if (data[0])
				db_rev = Number(data[0].VALUE);
			else
				mainConnection.query('INSERT INTO db_info VALUES (\'version\', \'' + last_rev + '\')');

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
						let contents = DBot.js.filesystem.readFileSync('./app/dbrevisions/' + i + '.sql', 'utf8');
						mainConnection.query(contents, usualCallback);
					});
				}

				callbackFuncs.push(function() {
					mainConnection.query('UPDATE db_info SET "VALUE" = \'' + last_rev + '\' WHERE "KEY" = \'version\';', function() {
						console.log('Upgrade complete.');
						hook.Run('SQLInitialize');
					});
				});

				callbackFuncs[0]();
			}
		});
	});
});