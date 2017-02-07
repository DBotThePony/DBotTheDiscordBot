
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
