
process.env['PATH'] = './bin;' + process.env['PATH'];
const stamp = (new Date()).getTime();

const Discord = require('discord.js');
const bot = new Discord.Client();

let stdin = process.openStdin();

stdin.addListener('data', function(data) {
	let str = data.toString().trim();
	
	if (str.substr(0, 5) == 'eval ') {
		let code = str.substr(5);
		console.log('eval(' + code + ')...')
		
		try {
			console.log('--> ', eval(code));
		} catch(err) {
			console.error(err);
		}
	}
});

DBot = {};
DBot.bot = bot;
DBot.client = bot;

try {
	DBot.cfg = require('./config.js');
} catch(err) {
	console.error('---------------------------------------');
	console.error('FATAL: Unable to open config file. Is it there? Is it valid?');
	console.error('---------------------------------------');
	
	throw err;
}

require('./app/init.js');

hook.RegisterEvents();
DBot.Discord = Discord;

let IS_INITIALIZED = false;
let LEVEL_OF_CONNECTION = 0;
let ALREADY_CONNECTING = false;
const token = DBot.cfg.token;

DBot.IsOnline = function() {
	return LEVEL_OF_CONNECTION > 0;
}

IsOnline = DBot.IsOnline;

let loginFunc = function() {
	if (LEVEL_OF_CONNECTION > 0) return;
	
	if (LEVEL_OF_CONNECTION < 0)
		LEVEL_OF_CONNECTION = 0;
	
	if (!IS_INITIALIZED || ALREADY_CONNECTING) return;
	ALREADY_CONNECTING = true;
	
	bot.login(token)
	.then(function() {
		ALREADY_CONNECTING = false;
	})
	.catch(function() {
		console.log('Reconnect failed. Retrying in 10 seconds');
		ALREADY_CONNECTING = false;
	});
}

let TimeoutID = null;

bot.on('disconnect', function() {
	LEVEL_OF_CONNECTION--;
	
	if (LEVEL_OF_CONNECTION > 0) return;
	
	if (LEVEL_OF_CONNECTION < 0)
		LEVEL_OF_CONNECTION = 0;
	
	if (!IS_INITIALIZED) return;
	if (TimeoutID) clearTimeout(TimeoutID);
	TimeoutID = null;
	
	DBot.SQL_START = false;
	console.log('Disconnected from servers!');
	hook.Run('OnDisconnected');
});

bot.on('ready', function() {
	LEVEL_OF_CONNECTION++;
	
	console.log('Connection established');
	DBot.InitVars();
	hook.Run('BotConnected', DBot.bot);
	
	DBot.SQL_START = false;
	
	if (TimeoutID)
		clearTimeout(TimeoutID);
	
	TimeoutID = setTimeout(function() {
		if (ALREADY_CONNECTING || LEVEL_OF_CONNECTION == 0) return;
		console.log('Initializing stuff');
		hook.Run('BotOnline', DBot.bot);
	}, 4000);
});

setInterval(loginFunc, 10000);

let nStamp = (new Date()).getTime();
console.log('Initialization complete in ' + (Math.floor((nStamp - stamp) * 100) / 100) + ' ms');

ALREADY_CONNECTING = true;

bot.login(token)
.then(function() {
	IS_INITIALIZED = true;
	ALREADY_CONNECTING = false;
	console.log('Bot ID: ' + bot.user.id);
})
.catch(function(err) {
	ALREADY_CONNECTING = false;
	console.error('Unable to login.');
	console.error(err);
});
