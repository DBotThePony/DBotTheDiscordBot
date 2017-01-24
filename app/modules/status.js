
const Statuses = [
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
	'WATCH_DOGS 2',
	'Cinematic Mod 2013',
	'BeamNG.drive',
	'DOTA 2',
	'Counter-Strike: Source',
	'Minecraft 1.10.2',
	'Minecraft 1.7.10',
	'Minecraft Beta 1.8.1',
	'Minecraft Alpha 1.2.1',
	'Left 4 Dead 2',
	'Saints Row IV',
	'Saints Row: The Third',
	'King\'s Bounty: Crossworlds',
	'Castle Crashers',
	'Smiley',
	'The Bridge',
	'Plague Inc: Evolved',
	'Medieval Engineers',
	'Super Hexagon',
	'Borderlands 2',
	'King\'s Bounty: The Legend',
	'Crashday',
	'Crashday Forever Mod',
	'Crashday IS THE BEST FORGOTTEN GAEM',
];

let changeStatus = function() {
	DBot.bot.user.setGame(DBot.RandomArray(Statuses));
}

let INITIALIZED = false;

hook.Add('BotOnline', 'BotStatus', function() {
	if (INITIALIZED)
		return;
	
	changeStatus();
	setInterval(changeStatus, 120000);
	
	INITIALIZED = true;
});
