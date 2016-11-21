
var toGet = 'https://api.imgflip.com/get_memes';
var unirest = require('unirest');
var fs = require('fs');

DBot.DefineMySQLTable('meme_cache', 'ID INTEGER NOT NULL PRIMARY KEY, URL VARCHAR(64) NOT NULL, NAME VARCHAR(128) NOT NULL');

// Memed
var UpdateMemes = function() {
	unirest.get(toGet)
	.end(function(response) {
		var data = response.body;
		
		if (!data)
			return;
		
		if (!data.success)
			return;
		
		var memes = data.data.memes;
		
		if (!memes)
			return;
		
		for (var i in memes) {
			var val = memes[i];
			
			MySQL.query('REPLACE INTO meme_cache (ID, URL, NAME) VALUES (' + DBot.MySQL.escape(val.id) + ', ' + DBot.MySQL.escape(val.url) + ', ' + DBot.MySQL.escape(val.name) + ')');
		}
	});
}

hook.Add('BotOnline', 'UpdateMemes', function() {
	UpdateMemes();
	setInterval(UpdateMemes, 3600000);
});

module.exports = {
	name: 'gmeme',
	alias: ['getmeme', 'meme_get', 'getmemes', 'get_memes', 'memd', 'badmeme', 'gmeme'],
	
	argNeeded: false,
	delay: 3,
	
	help_args: '',
	desc: 'Random meme from https://imgflip.com/',
	
	func: function(args, cmd, rawcmd, msg) {
		MySQL.query('SELECT URL, NAME FROM `meme_cache` ORDER BY RAND() LIMIT 1, 1', function(err, data) {
			var meme = data[0];
			
			msg.reply('\n' + meme.NAME + '\n' + meme.URL);
		});
	}
}