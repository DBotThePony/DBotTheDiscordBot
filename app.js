
process.env['PATH'] = './bin;' + process.env['PATH'];
var stamp = (new Date()).getTime();

const Discord = require('discord.js');
const bot = new Discord.Client();
var token = "MjQ4NzU2MjM1ODg3ODM3MTk0.Cw8Xzg.wAxaM4qN6docKitkQe-PDud_IM0";

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

require('./app/init.js');
DBot.bot = bot;
DBot.client = bot;
hook.RegisterEvents();
DBot.Discord = Discord;

let msgFuncs = [
	function(str) {
		if (this.wasDeleted)
			return {then: function() {}, catch: function() {}};
		
		let promise = this.___reply(str);
		let self = this;
		
		promise.then(function(nmsg) {
			self.replies.push(nmsg);
			
			if (self.wasDeleted)
				nmsg.delete(0);
		});
		
		return promise;
	},
	
	function(str) {
		if (this.wasDeleted)
			return {then: function() {}, catch: function() {}};
		
		let promise = this.channel.sendMessage(str);
		let self = this;
		
		promise.then(function(nmsg) {
			self.replies.push(nmsg);
			
			if (self.wasDeleted)
				nmsg.delete(0);
		});
		
		return promise;
	}
];

bot.on('message', function(msg) {
	msg.replies = msg.replies || [];
	
	msg.promiseReply = msgFuncs[0];
	msg.promiseSend = msgFuncs[1];
	msg.___reply = msg.___reply || msg.reply; // There is also oldReply, but oldReply is used when command was actually executed.
	msg.reply = msg.promiseReply;
	
	try {
		msg.internalCreateTime = CurTime();
		hook.Run('OnMessage', msg);
		
		if (DBot.IsMyMessage(msg))
			return;
		
		if (hook.Run('CheckValidMessage', msg) === true)
			return;
		
		if (hook.Run('PreOnValidMessage', msg) === true)
			return;
		
		hook.Run('OnValidMessage', msg);
		
		if (!msg.author.bot) {
			var supp = hook.Run('OnHumanMessage', msg);
			
			if (supp === true)
				return;
		}
		
		if (msg.channel.type == 'dm') {
			try {
				DBot.HandleMessage(msg, true)
				return;
			} catch(err) {
				console.error(err);
				return;
			}
		}
		
		if (!DBot.IsAskingMe(msg))
			return;
		
		if (DBot.IsAskingMe(msg) && !DBot.IsAskingMe_Command(msg)) {
			let myPrefix = DBot.MessagePrefix(msg);
			
			if (myPrefix)
				msg.reply('Hi? x3 @NotDBot help or ' + myPrefix + 'help');
			else
				msg.reply('Hi? x3 @NotDBot help');
			
			
			return;
		}
		
		try {
			DBot.HandleMessage(msg);
		} catch(err) {
			console.error(err);
		}
	} catch(err) {
		console.error(err);
	}
});

var IS_INITIALIZED = false;
var LEVEL_OF_CONNECTION = 0;

DBot.IsOnline = function() {
	return LEVEL_OF_CONNECTION > 0;
}

IsOnline = DBot.IsOnline;

var loginFunc = function() {
	if (LEVEL_OF_CONNECTION > 0)
		return;
	
	if (LEVEL_OF_CONNECTION < 0)
		LEVEL_OF_CONNECTION = 0;
	
	if (!IS_INITIALIZED)
		return;
	
	bot.login(token)
	.then(function() {})
	.catch(function() {
		console.log('Reconnect failed. Retrying in 10 seconds');
	});
}

bot.on('disconnect', function() {
	LEVEL_OF_CONNECTION--;
	
	if (LEVEL_OF_CONNECTION > 0)
		return;
	
	if (LEVEL_OF_CONNECTION < 0)
		LEVEL_OF_CONNECTION = 0;
	
	if (!IS_INITIALIZED)
		return;
	
	console.log('Disconnected from servers!');
	
	hook.Run('OnDisconnected');
});

bot.login(token).then(function() {
	IS_INITIALIZED = true;
});

bot.on('ready', function() {
	LEVEL_OF_CONNECTION++;
	
	console.log('Connection established');
	DBot.InitVars();
	
	setTimeout(function() {
		console.log('Initializing stuff');
		hook.Run('BotOnline', DBot.bot);
	}, 4000); // Wait before all loads
});

setInterval(loginFunc, 10000);

var nStamp = (new Date()).getTime();

console.log('Initialization complete in ' + (Math.floor((nStamp - stamp) * 100) / 100) + ' ms');
