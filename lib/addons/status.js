
var Statuses = [
	'in Equestria',
	'with you',
	'Team Fortress 2',
	'Garry\'s Mod',
	'Crazy Machines 2',
	'Space Engineers',
	'with memes',
	'with Rainbow Dash',
	'World of Goo',
	'FlatOut 2',
	'Node.JS',
	'on Python 2.7',
	'with C++',
	'on Keyboard',
	'game',
	'inside your PC',
	'with toys on your head',
];

var changeStatus = function() {
	DBot.bot.user.setGame(DBot.RandomArray(Statuses));
}

hook.Add('BotOnline', 'BotStatus', function() {
	changeStatus();
	setInterval(changeStatus, 120000);
});
