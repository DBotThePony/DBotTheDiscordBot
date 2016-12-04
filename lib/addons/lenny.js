
var lennyRegExp = /\([ ]* ͡°[ ]* ͜?ʖ[ ]* ͡°[ ]*\)/gi;

hook.Add('OnHumanMessage', 'Lenny', function(msg) {
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
