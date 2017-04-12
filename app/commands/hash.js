

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

module.exports = {
	name: 'hash',
	alias: ['md5'],
	
	argNeeded: true,
	
	help_args: '<text>',
	desc: 'Posts a MD5 checksumm of string',
	
	func: function(args, cmd, msg) {
		return String.hash5(cmd);
	}
}

DBot.RegisterCommand({
	name: 'hash1',
	alias: ['sha1'],
	
	argNeeded: true,
	
	help_args: '<text>',
	desc: 'Posts a SHA1 checksumm of string',
	
	func: function(args, cmd, msg) {
		return String.hash1(cmd);
	}
});

DBot.RegisterCommand({
	name: 'hash512',
	alias: ['sha512'],
	
	argNeeded: true,
	
	help_args: '<text>',
	desc: 'Posts a SHA512 checksumm of string',
	
	func: function(args, cmd, msg) {
		return String.hash512(cmd);
	}
});

DBot.RegisterCommand({
	name: 'hash256',
	alias: ['sha256'],
	
	argNeeded: true,
	
	help_args: '<text>',
	desc: 'Posts a SHA256 checksumm of string',
	
	func: function(args, cmd, msg) {
		return String.hash(cmd);
	}
});
