
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
