
cvars.ServerVar('notifications', '0', [FCVAR_BOOLONLY], 'Enable join/leave notifications');
cvars.ServerVar('notify_join', 'Hello, %user%! Welcome to %server%! You are %num%rd member to join.', [], 'Join message. Use %username% for printing only user\'s name, not @mention him.');
cvars.ServerVar('notify_left', '%user% left us alone ;n;', [], 'Leave message');

hook.Add('SoftbanJoinPass', 'Notifications', function(user, server, member) {
	if (member.user.bot)
		return;
	
	if (!DBot.ServerIsInitialized(server))
		return;
	
	if (!cvars.Server(server).getVar('notifications').getBool())
		return;
	
	let channel = DBot.GetNotificationChannel(server);
	
	if (!channel)
		return;
	
	let format = cvars.Server(server).getVar('notify_join').getString()
		.replace('%user%', '<@' + user.id + '>')
		.replace('%username%', user.username)
		.replace('%num%', server.members.array().length)
		.replace('%server%', '**' + server.name + '**');
	
	channel.sendMessage(format);
});

hook.Add('HumanLeftServer', 'Notifications', function(user, server, member) {
	if (!DBot.ServerIsInitialized(server))
		return;
	
	if (!cvars.Server(server).getVar('notifications').getBool())
		return;
	
	let channel = DBot.GetNotificationChannel(server);
	
	if (!channel)
		return;
	
	if (member.kickedBySoftban)
		return;
	
	let format = cvars.Server(server).getVar('notify_left').getString()
		.replace('%user%', '<@' + user.id + '>')
		.replace('%username%', user.username)
		.replace('%server%', '**' + server.name + '**');
	
	channel.sendMessage(format);
});
