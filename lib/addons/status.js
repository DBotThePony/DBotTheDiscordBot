
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
	'Minecraft',
	'Meincraft',
	'ModCraft',
	'IndustrialCraft V1.33.8',
	'l33t simulator',
	'inside your PC',
	'Medieval Engineers',
	'Rome: Total War I',
	'Settlers II: Vikings',
	'inside Derpibooru.org',
	'with Firefox',
	'Star Wars: Empire At War',
	'Worms: Ultimate Mayhem',
	'Spell Force 2: Gold Edition',
	'Nuclear Dawn',
	'Infinifactory',
	'Killing Floor',
	'Portal 2',
	'Distance',
	'Torchlight',
	'Torchlight II',
	'with toys on your head',
];

var changeStatus = function() {
	DBot.bot.user.setGame(DBot.RandomArray(Statuses));
}

var INITIALIZED = false;

hook.Add('BotOnline', 'BotStatus', function() {
	if (INITIALIZED)
		return;
	
	changeStatus();
	setInterval(changeStatus, 120000);
	
	INITIALIZED = true;
});
