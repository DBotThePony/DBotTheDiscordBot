

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

module.exports = {
	name: 'retry',
	
	help_hide: false,
	desc: 'Executes previous command',
	delay: -0.1,
	
	func: function(args, cmd, msg) {
		let cid = msg.channel.id;
		let uid = msg.author.id;
		if (!DBot.__LastRetryCommand[cid])
			DBot.__LastRetryCommand[cid] = {};
		
		if (!DBot.__LastRetryCommand[cid][uid])
			return 'There was no command before! ;w;';
		
		let data = DBot.__LastRetryCommand[cid][uid];
		let cCommand = data[0];
		let parsedArgs = data[1];
		let rawcmd = data[2];
		let moreArgs = data[3];
		let parsedHandlers = data[4];
		
		DBot.ExecuteCommand(cCommand, msg, parsedArgs, rawcmd, cCommand.id, moreArgs, parsedHandlers);
	},
};

