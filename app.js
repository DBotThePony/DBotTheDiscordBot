
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

let LEVEL_OF_CONNECTION = 0;
const token = DBot.cfg.token;

DBot.IsOnline = function() {
	return LEVEL_OF_CONNECTION > 0;
}

IsOnline = DBot.IsOnline;

let TimeoutID = null;

bot.on('disconnect', function() {
	LEVEL_OF_CONNECTION--;
	
	if (LEVEL_OF_CONNECTION > 0) return;
	
	if (LEVEL_OF_CONNECTION < 0)
		LEVEL_OF_CONNECTION = 0;
	
	if (TimeoutID) clearTimeout(TimeoutID);
	TimeoutID = null;
	
	DBot.SQL_START = false;
	console.log('Disconnected from servers!');
	hook.Run('OnDisconnected');
});

let sqlRun = false;
let shouldRunAfterSQL = false;

let timerOnlineFunc = function() {
	if (!sqlRun || LEVEL_OF_CONNECTION === 0) return;
	console.log('Initializing stuff');
	hook.Run('BotOnline', DBot.bot);
}

hook.Add('SQLInitialize', 'Core', function() {
	console.log('SQLInitialize');
	sqlRun = true;
	if (shouldRunAfterSQL) timerOnlineFunc();
});

bot.on('ready', function() {
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
});

let nStamp = (new Date()).getTime();
console.log('Initialization complete in ' + (Math.floor((nStamp - stamp) * 100) / 100) + ' ms');

bot.login(token)
.then(function() {
	console.log('Bot ID: ' + bot.user.id);
})
.catch(function(err) {
	console.error('Unable to login.');
	console.error(err);
});
