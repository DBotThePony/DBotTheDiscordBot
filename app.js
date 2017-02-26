
/* global hook, DBot */

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

global.sprintf = require('sprintf-js').sprintf;
global.DBot = global.DBot || {};

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

global.MathHelper = require('./app/lib/mathhelper.js');
global.CommandHelper = require('./app/lib/commandhelper.js');
require('./app/lib/extensions/array.js');
require('./app/lib/extensions/number.js');
require('./app/lib/extensions/string.js');
require('./app/lib/extensions/console.js');

let IS_CONNECTED = false;
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
require('./app/lib/member_storage.js');
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

const Status = {
	READY: 0,
	CONNECTING: 1,
	RECONNECTING: 2,
	IDLE: 3,
	NEARLY: 4,
	DISCONNECTED: 5
};

DBot.IsOnline = function() {
	return bot.status === Status.READY;
};

const timerOnlineFunc = function() {
	if (!sqlRun || bot.status !== Status.READY) return;
	console.log('Initializing stuff');
	hook.Run('BotOnline', DBot.bot);
};

hook.Add('SQLInitialize', 'Core', function() {
	sqlRun = true;
	if (shouldRunAfterSQL) timerOnlineFunc();
});

DBot.disconnectEvent = function(event) {
	if (!IS_CONNECTED) return;
	if (bot.status === Status.READY) return;
	IS_CONNECTED = false;
	
	if (TimeoutID) clearTimeout(TimeoutID);
	TimeoutID = null;
	
	DBot.SQL_START = false;
	console.log('Disconnected from servers!');
	hook.Run('OnDisconnected');
	
	if (event.code === 1000) { // CLOSE_NORMAL
		// On this case, Discord.js doesn't do auto reconnect
		// Reconnect by ourselves
		// That happens when bot was online too long, and
		// nginx keepalive_requests was exhausted on discord side
		
		console.log('Reconnecting manually');
		
		setTimeout(() => {
			bot.login(token)
			.then(() => console.log('Reconnected manually'))
			.catch(err => {console.error('Unable to login.'); console.error(err);});
		}, 6000);
	}
};

DBot.readyEvent = function() {
	if (IS_CONNECTED) return;
	
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
