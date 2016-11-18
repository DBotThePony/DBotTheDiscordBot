
hook.Add('BotJoinsServer', 'HelloMessage', function(member, server) {
	var channel = DBot.GetNotificationChannel(server);
	
	if (!channel)
		return;
	
	channel.sendMessage(DBot.FormatAsk(member) + 'beep boop son, beep boop.');
});

hook.Add('BotLeftServer', 'HelloMessage', function(member, server) {
	var channel = DBot.GetNotificationChannel(server);
	
	if (!channel)
		return;
	
	channel.sendMessage(DBot.FormatAsk(member) + ';w;');
});
