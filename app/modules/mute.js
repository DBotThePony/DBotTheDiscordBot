
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

cvars.ChannelVar('mute', '0', [FCVAR_BOOLONLY], 'Bot stops to respond to any command in current channel');

hook.Add('ExecuteCommand', 'Statistics', function(user, command, msg) {
	if (DBot.IsPM(msg)) {
		return;
	}
	
	if (command == 'cvar' || command == 'cvarlist') {
		return;
	}
	
	if (cvars.Channel(msg.channel).getVar('mute').getBool()) {
		return false;
	}
});
