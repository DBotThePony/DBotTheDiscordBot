
var toGet = 'https://api.imgflip.com/get_memes';
var unirest = require('unirest');
var fs = require('fs');

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
			
			MySQL.query('INSERT INTO meme_cache ("ID", "URL", "NAME") VALUES (' + Util.escape(val.id) + ', ' + Util.escape(val.url) + ', ' + Util.escape(val.name) + ') ON CONFLICT UPDATE SET "URL" = ' + Util.escape(val.url) + ', "NAME" = ' + Util.escape(val.name));
		}
	});
}

var INITIALIZED = false;

hook.Add('BotOnline', 'UpdateMemes', function() {
	if (INITIALIZED)
		return;
	
	UpdateMemes();
	setInterval(UpdateMemes, 3600000);
	
	INITIALIZED = true;
});

module.exports = {
	name: 'gmeme',
	alias: ['getmeme', 'meme_get', 'getmemes', 'get_memes', 'memd', 'badmeme', 'gmeme'],
	
	argNeeded: false,
	delay: 3,
	
	help_args: '',
	desc: 'Random meme from https://imgflip.com/',
	
	func: function(args, cmd, msg) {
		MySQL.query('SELECT URL, NAME FROM meme_cache ORDER BY RAND() LIMIT 1', function(err, data) {
			var meme = data[0];
			
			msg.reply('\n' + meme.NAME + '\n' + meme.URL);
		});
	}
}
