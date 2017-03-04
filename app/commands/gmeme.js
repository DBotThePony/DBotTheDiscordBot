
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const toGet = 'https://api.imgflip.com/get_memes';
const unirest = require('unirest');
const fs = require('fs');
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
			
			Postgres.query('INSERT INTO meme_cache ("ID", "URL", "NAME") VALUES (' + Postgres.escape(val.id) + ', ' + Postgres.escape(val.url) + ', ' + Postgres.escape(val.name) + ') ON CONFLICT ("ID") DO UPDATE SET "URL" = ' + Postgres.escape(val.url) + ', "NAME" = ' + Postgres.escape(val.name));
		}
	});
};

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
		Postgres.query('SELECT "URL", "NAME" FROM meme_cache ORDER BY random() LIMIT 1', function(err, data) {
			let meme = data[0];
			
			msg.reply('\n' + meme.NAME + '\n' + meme.URL);
		});
	}
};
