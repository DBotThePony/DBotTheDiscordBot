

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

cvars.ServerVar('bot_hello', '1', [FCVAR_BOOLONLY], 'Say hello to joining bots');

hook.Add('BotJoinsServer', 'HelloMessage', function(member, server) {
	if (!cvars.Server(server).getVar('bot_hello').getBool())
		return;
	
	let channel = DBot.GetNotificationChannel(server);
	
	if (!channel)
		return;
	
	channel.sendMessage(DBot.FormatAsk(member) + 'beep boop son, beep boop.');
});

hook.Add('BotLeftServer', 'HelloMessage', function(member, server) {
	if (!cvars.Server(server).getVar('bot_hello').getBool())
		return;
	
	let channel = DBot.GetNotificationChannel(server);
	
	if (!channel)
		return;
	
	channel.sendMessage(DBot.FormatAsk(member) + ';w;');
});

hook.Add('OnJoinedServer', 'Logging', function(server) {
	console.log('Joined the server: ' + server.id);
});

hook.Add('OnLeftServer', 'Logging', function(server) {
	console.log('Left the server: ' + server.id);
});