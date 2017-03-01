
/* global DBot, Symbol, hook */

class SQLResult {
	constructor(connection, dispatcher, rawData, err) {
		this.connection = connection;
		this.worker = connection;
		this.dispatcher = dispatcher;
		this.err = err;
		
		if (rawData) {
			this.rawRows = rawData.rows;
			this.rawData = rawData;
		} else {
			this.rawRows = [];
			this.rawData = {rows: []};
		}
		
		this.amountOfRows = this.rawRows.length;
		
		for (let i in this.rawRows) {
			this[i] = this.rawRows[i];
		}
		
		this.currentSeek = 0;
	}
	
	throw() {
		if (this.err) throw this.err;
	}
	
	seek() {
		const seeked = this.rawRows[this.currentSeek];
		this.currentSeek++;
		return seeked;
	}
	
	empty(callback) {
		const status = this.rawRows.length === 0 || (this.err !== undefined && this.err !== null);
		if (status && callback) callback();
		return status;
	}
	
	getConnection() {
		return this.connection;
	}
	
	getDispatcher() {
		return this.connection.dispatcher;
	}
	
	*[Symbol.iterator]() {
		if (this.err) yield [];
		for (let i = 0; i < this.amountOfRows; i++) {
			yield this.rawRows[i];
		}
	}
};

class SQLConnectionDispatcher {
	constructor(config) {
		this.counter = 0;
		this.errcounter = 0;
		this.waiting = 0;
		
		this.load = [];
		
		this.config = config;
		config.workers = config.workers || 1;
		this.connections = [];
		
		for (let i = 0; i < this.config.workers; i++) {
			this.connections.push(new pg.Client(config));
			this.load[i] = 0;
		}
	}
	
	findBestWorker() {
		let min = this.load[0];
		let workerID = 0;
		
		for (const i of this.load) {
			if (this.load[i] < min) {
				workerID = i;
			}
		}
		
		return [this.connections[workerID], workerID];
	}
	
	onResult(workerID, oldStack, query, callback, err, data) {
		let newErrorMessage;
		this.waiting--;
		this.load[workerID]--;

		if (err) {
			this.errcounter++;
			newErrorMessage = 'Worker ID: ' + workerID + '\nQUERY: ' + (err.internalQuery || query) + '\nERROR: ' + err.message;

			if (err.hint) newErrorMessage += '\nHINT: ' + err.hint;
			if (err.detail) newErrorMessage += '\n' + err.hint;

			newErrorMessage += '\n' + oldStack;
			err.stack = newErrorMessage;

			if (!callback) throw err;
		}

		if (!callback) return;
		
		let result = new SQLResult(this.connections[workerID], this, data);

		try {
			callback(err, result);
		} catch(newErr) {
			let e = new Error(newErr);
			e.stack = newErr.stack + '\n ------- \n' + oldStack.substr(6);
			console.error(e);
		}
	}
	
	query(query, callback) {
		this.counter++;
		this.waiting++;
		
		let result = this.findBestWorker();
		let worker = result[0];
		let workerID = result[1];
		
		this.load[workerID]++;
		
		let oldStack = new Error().stack;
		let self = this;

		worker.query(query, (err, data) => self.onResult(workerID, oldStack, query, callback, err, data));
	}
	
	connect(callback) {
		let errDef;
		let done = 0;
		let total = this.config.workers;
		
		for (const conn of this.connections) {
			conn.connect(function(err) {
				if (errDef) return;
				
				if (err) {
					if (!callback) throw err;
					
					errDef = err;
					callback(errDef);
					return;
				}
				
				done++;
				
				if (done === total) {
					if (callback) callback(null);
				}
			});
		}
	}
	
	toString() {
		return '[SQLConnectionDispatcher: W:' + this.waiting + '|Q:' + this.counter + '|E:' + this.errcounter + ']';
	}
	
	escape(str) {
		if (typeof str === 'undefined')
			return 'null';
		
		if (typeof str === 'boolean')
			return str && "true" || "false";

		if (typeof str === 'number')
			return "" + str + "";

		let strObj = str.toString()
		.replace(/'/gi, '\'\'')
		.replace(/\\/gi, '\\\\')
		.replace(/\//gi, '\/');

		strObj = '\'' + strObj + '\'';

		return strObj;
	}
};

const pg = require('pg');
const fs = DBot.js.fs;

const pgConfig = {
	user: DBot.cfg.sql_user,
	database: DBot.cfg.sql_database,
	password: DBot.cfg.sql_password,
	host: DBot.cfg.sql_hostname,
	workers: DBot.cfg.sql_workers,
	port: DBot.cfg.sql_port
};

const mainConnection = new SQLConnectionDispatcher(pgConfig);
const secondaryConnection = new SQLConnectionDispatcher(pgConfig);

Postgre = mainConnection;
Postgres = mainConnection;
DBot.Postgre = mainConnection;
DBot.Postgres = mainConnection;
DBot.secondarySQLConnection = secondaryConnection;

const sqlPg = fs.readFileSync('./app/postgres.sql', 'utf8').replace(/\r/gi, '');

mainConnection.connect(function(err) {
	if (err) {console.error(err); process.exit(1);}
	
	mainConnection.query(sqlPg, function(err) {
		if (err) {console.error(err); process.exit(1);}
		
		if (DBot.SQL_FILE_LOADED) return;
		DBot.SQL_FILE_LOADED = true;

		let db_rev = 0;
		let last_rev = DBot.js.filesystem.readdirSync('./app/dbrevisions/').length;

		mainConnection.query('SELECT "VALUE" FROM db_info WHERE "KEY" = \'version\'', function(err, data) {
			if (err) {console.error(err); process.exit(1);}
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
						console.error(err);
						process.exit(1);
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

secondaryConnection.connect();
