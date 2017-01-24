
const toGet = 'https://api.imgflip.com/get_memes';
const unirest = DBot.js.unirest;
const fs = DBot.js.fs;
let INITIALIZED = false;

// Memed
let UpdateMemes = function() {
	unirest.get(toGet)
	.end(function(response) {
		let data = response.body;
		
		if (!data)
			return;
		
		if (!data.success)
			return;
		
		let memes = data.data.memes;
		
		if (!memes)
			return;
		
		for (let i in memes) {
			let val = memes[i];
			
			MySQL.query('INSERT INTO meme_cache ("ID", "URL", "NAME") VALUES (' + Util.escape(val.id) + ', ' + Util.escape(val.url) + ', ' + Util.escape(val.name) + ') ON CONFLICT ("ID") DO UPDATE SET "URL" = ' + Util.escape(val.url) + ', "NAME" = ' + Util.escape(val.name));
		}
	});
}

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
		MySQL.query('SELECT "URL", "NAME" FROM meme_cache ORDER BY random() LIMIT 1', function(err, data) {
			let meme = data[0];
			
			msg.reply('\n' + meme.NAME + '\n' + meme.URL);
		});
	}
}
