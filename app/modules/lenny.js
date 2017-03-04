
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const lennyRegExp = /\([ ]* ͡°[ ]* ͜?ʖ[ ]* ͡°[ ]*\)/gi;

hook.Add('OnHumanMessage', 'Lenny', function(msg) {
	if (DBot.IsAskingMe(msg))
		return;
	
	if (hook.Run('CanReply', msg) === false)
		return;
	
	if (!DBot.IsPM(msg)) {
		let mute = cvars.Channel(msg.channel).getVar('mute');
		
		if (mute) {
			if (mute.getBool()) {
				return;
			}
		}
	}
	
	if (msg.content.match(lennyRegExp)) {
		msg.reply('(  ͡° ͡°  ʖ  ͡° ͡°  )');
		return true;
	}
});
