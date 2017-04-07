

// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

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
