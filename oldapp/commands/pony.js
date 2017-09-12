

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

'use strict';

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const fs = require('fs');
let AvaliablePonies = [];
let AvaliablePoniesPNG = [];

fs.readdir('./resource/poni_txt/', function(err, files) {
	files.forEach(function(file) {
		fs.readFile('./resource/poni_txt/' + file, 'utf8', function(err, data) {
			if (err) {
				console.error(err);
				return;
			}
			
			AvaliablePonies.push(data);
		});
	});
});

fs.readdir('./resource/poni/', function(err, files) {
	AvaliablePoniesPNG = files;
});

module.exports = {
	name: 'pony',
	alias: ['pone', 'ponie', 'poni', 'pne'],
	
	argNeeded: false,
	help_args: '',
	help_hide: true,
	desc: 'Ponies',
	delay: 10,
	
	func: function(args, cmd, msg) {
		let ponePNG = Array.Random(AvaliablePoniesPNG);
		
		fs.readFile('./resource/poni/' + ponePNG, {encoding: null}, function(err, data) {
			msg.channel.sendFile(data, ponePNG)
			.catch(function() {
				msg.channel.sendMessage('```' + Array.Random(AvaliablePonies.length) + '```');
			});
		});
	},
};
