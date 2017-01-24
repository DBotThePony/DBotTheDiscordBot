
cvars.ServerVar('bot_hello', '1', [FCVAR_BOOLONLY], 'Say hello to joining bots');

hook.Add('BotJoinsServer', 'HelloMessage', function(member, server) {
	if (!cvars.Server(server).getVar('bot_hello').getBool())
		return;
	
	let channel = DBot.GetNotificationChannel(server);
	
	if (!channel)
		return;
	
	channel.sendMessage(DBot.FormatAsk(member) + 'beep boop son, beep boop.');
});

hook.Add('BotLeftServer', 'HelloMessage', function(member, server) {
	if (!cvars.Server(server).getVar('bot_hello').getBool())
		return;
	
	let channel = DBot.GetNotificationChannel(server);
	
	if (!channel)
		return;
	
	channel.sendMessage(DBot.FormatAsk(member) + ';w;');
});

hook.Add('OnJoinedServer', 'Logging', function(server) {
	console.log('Joined the server: ' + server.id);
});

hook.Add('OnLeftServer', 'Logging', function(server) {
	console.log('Left the server: ' + server.id);
});