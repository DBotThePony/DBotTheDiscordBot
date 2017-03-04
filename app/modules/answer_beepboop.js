
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

hook.Add('HandleAsk', 'AnswerBeepBoop', function(msg, command) {
	if (msg.author.bot) return; // Endless reply-reply loop
	if (command) return;
	msg.author.lastBeepBoopReply = msg.author.lastBeepBoopReply || CurTime();
	if (msg.author.lastBeepBoopReply < CurTime()) return;
	msg.author.lastBeepBoopReply = CurTime() + 4;
	
	if (msg.content.match('beep') && msg.content.match('boop')) {
		msg.reply('Beep boop');
		return true;
	}
});
