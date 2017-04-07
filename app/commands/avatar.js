

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
	name: 'avatar',
	
	help_args: '<user1> ...',
	desc: 'Prints user(s) avatar(s) URL(s)',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Nu user argument ;w;';
		
		let build = '';
		
		for (let user of args) {
			if (typeof(user) != 'object')
				return 'Invalid user argument. Use @User';
			
			build += '\n<@' + user.id + '>\'s Avatar: ' + (user.avatarURL || 'User have no avatar');
		}
		
		return build;
	}
}
