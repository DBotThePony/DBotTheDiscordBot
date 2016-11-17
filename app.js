'use strict';

const Discord = require('discord.js');
const bot     = new Discord.Client();
var token = "MjQ4NzU2MjM1ODg3ODM3MTk0.Cw8Xzg.wAxaM4qN6docKitkQe-PDud_IM0";

require('./lib/init.js');

bot.on('message', msg => {
	// Fired when someone sends a message
	
	hook.Run('OnMessage', msg);
	
	if (DBot.IsMyMessage(msg))
		return;
	
	hook.Run('OnValidMessage', msg);
	
	if (msg.channel.type == 'dm') {
		DBot.HandleMessage(msg, true)
		return;
	}
	
	if (!DBot.IsAskingMe(msg))
		return;
	
	if (DBot.IsAskingMe(msg) && !DBot.IsAskingMe_Command(msg)) {
		msg.reply('What do you want? @NotDBot help')
		return;
	}
	
	try {
		DBot.HandleMessage(msg);
	} catch(err) {
		msg.reply('@_@ Something went wrong with me.');
		console.log('REPORTED EXCEPTION: ' + err);
	}
});

bot.login(token).then(() => {
	console.log('Running!');
	DBot.bot = bot;
	DBot.InitVars();
});
