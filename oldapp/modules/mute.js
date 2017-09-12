

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

cvars.ChannelVar('mute', '0', [FCVAR_BOOLONLY], 'Bot stops to respond to any command in current channel');

hook.Add('ExecuteCommand', 'Statistics', function(user, command, msg) {
	if (DBot.IsPM(msg)) {
		return;
	}
	
	if (command == 'cvar' || command == 'cvarlist') {
		return;
	}
	
	if (cvars.Channel(msg.channel).getVar('mute').getBool()) {
		return false;
	}
});
