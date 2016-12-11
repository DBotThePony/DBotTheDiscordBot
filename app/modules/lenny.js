
var lennyRegExp = /\([ ]* ͡°[ ]* ͜?ʖ[ ]* ͡°[ ]*\)/gi;

hook.Add('OnHumanMessage', 'Lenny', function(msg) {
	if (DBot.IsAskingMe(msg))
		return;
	
	if (hook.Run('CanReply', msg) === false)
		return;
	
	if (!DBot.IsPM(msg)) {
		var mute = cvars.Channel(msg.channel).getVar('mute');
		
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
