
/* global hook */

sprintf = require('sprintf-js').sprintf;

process.env['PATH'] = './bin;' + process.env['PATH'];
const stamp = (new Date()).getTime();
const Discord = require('discord.js');

const options = {
	autoReconnect: true
};

const bot = new Discord.Client(options);

let stdin = process.openStdin();

stdin.addListener('data', function(data) {
	let str = data.toString().trim();
	
	if (str.substr(0, 5) === 'eval ') {
		let code = str.substr(5);
		console.log('eval(' + code + ')...');
		
		try {
			console.log('--> ', eval(code));
		} catch(err) {
			console.error(err);
		}
	}
});

DBot = {};

try {
	DBot.cfg = require('./config.js');
} catch(err) {
	console.error('---------------------------------------');
	console.error('FATAL: Unable to open config file. Is it there? Is it valid?');
	console.error('---------------------------------------');
	
	throw err;
}

// Small safety stuff
const token = DBot.cfg.token;
DBot.cfg.token = undefined;

DBot.js = {};

DBot.js.child_process = require('child_process');
DBot.js.unirest = require('unirest');
DBot.js.fs = require('fs');
DBot.js.pug = require('pug');
DBot.js.filesystem = DBot.js.fs;
DBot.js.json3 = require('json3');
DBot.js.moment = require('moment');
DBot.js.numeral = require('numeral');
DBot.js.url = require('url');
DBot.js.crypto = require('crypto');
DBot.js.hDuration = require('humanize-duration');
DBot.js.os = require('os');
DBot.js.Discord = Discord;
DBot.js.sprintf = sprintf;

MathHelper = require('./app/lib/mathhelper.js');
require('./app/lib/extensions/array.js');
require('./app/lib/extensions/number.js');
require('./app/lib/extensions/string.js');

let LEVEL_OF_CONNECTION = 0;
let TimeoutID = null;
let sqlRun = false;
let shouldRunAfterSQL = false;

DBot.bot = bot;
DBot.client = bot;
DBot.Discord = Discord;
DBot.WebRoot = DBot.cfg.webroot;
DBot.URLRootBare = DBot.cfg.webpath;
DBot.URLRoot = DBot.cfg.protocol + '://' + DBot.cfg.webpath;
DBot.owners = DBot.cfg.owners;

DBot.fs = DBot.js.fs;

require('./app/lib/util.js');
require('./app/lib/hook.js');
require('./app/lib/sql.js');
require('./app/lib/imagick.js');
require('./app/lib/emoji.js');

require('./app/lib/cvars.js');
require('./app/generic.js');
require('./app/lib/tags.js');
require('./app/lib/commban.js');

require('./app/handler.js');
require('./app/commands.js');

require('./app/lib/confirm.js');

for (const file of DBot.fs.readdirSync('./app/modules/')) {
	let sp = file.split('.');
	if (!sp[1] || sp[1] !== 'js') continue;
	
	require('./app/modules/' + file);
};

DBot.START_STAMP = (new Date()).getTime() / 1000;

hook.RegisterEvents();

DBot.IsOnline = function() {
	return LEVEL_OF_CONNECTION > 0;
};

const timerOnlineFunc = function() {
	if (!sqlRun || LEVEL_OF_CONNECTION === 0) return;
	console.log('Initializing stuff');
	hook.Run('BotOnline', DBot.bot);
};

hook.Add('SQLInitialize', 'Core', function() {
	sqlRun = true;
	if (shouldRunAfterSQL) timerOnlineFunc();
});

DBot.disconnectEvent = function(event) {
	LEVEL_OF_CONNECTION--;
	
	if (LEVEL_OF_CONNECTION > 0) return;
	
	if (LEVEL_OF_CONNECTION < 0)
		LEVEL_OF_CONNECTION = 0;
	
	if (TimeoutID) clearTimeout(TimeoutID);
	TimeoutID = null;
	
	DBot.SQL_START = false;
	console.log('Disconnected from servers!');
	hook.Run('OnDisconnected');
};

DBot.readyEvent = function() {
	LEVEL_OF_CONNECTION++;
	
	if (LEVEL_OF_CONNECTION >= 2) {
		console.log('Connection was duplicated! WTF?');
		return;
	}
	
	console.log('Connection established');
	DBot.InitVars();
	hook.Run('BotConnected', DBot.bot);
	
	DBot.SQL_START = false;
	DBot.Status('Initializing');
	
	if (TimeoutID)
		clearTimeout(TimeoutID);
	
	TimeoutID = setTimeout(function() {
		if (!sqlRun)
			shouldRunAfterSQL = true;
		else
			timerOnlineFunc();
	}, 6000);
};

IsOnline = DBot.IsOnline;

bot.on('ready', DBot.readyEvent);
bot.on('disconnect', DBot.disconnectEvent);

const nStamp = (new Date()).getTime();
console.log('Initialization complete in ' + (Math.floor((nStamp - stamp) * 100) / 100) + ' ms. Connecting...');

bot.login(token)
.then(() => console.log('Bot ID: ' + bot.user.id))
.catch(err => {console.error('Unable to login.'); console.error(err);});
