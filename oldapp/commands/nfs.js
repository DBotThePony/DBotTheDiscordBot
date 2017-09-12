

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

module.exports = {
	name: 'nfs',
	alias: ['needforsleep'],
	
	help_args: '',
	desc: 'Need For Sleep',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		fs.readFile('./resource/files/nfs.png', {encoding: null}, function(err, data) {
			if (!data)
				return;
			
			if (msg.wasDeleted)
				return;
			
			msg.channel.sendFile(data, 'nfs.jpg').then(function(msg2) {
				if (msg.wasDeleted)
					msg2.delete(0);
				else {
					msg.replies = msg.replies || [];
					msg.replies.push(msg2);
				}
			});
		});
	}
}
