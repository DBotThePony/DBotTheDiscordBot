

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

DBot.MemberMethods = DBot.MemberMethods || new Map();
DBot.MemberConstructors = DBot.MemberConstructors || new Map();
DBot.MemberStorage = DBot.MemberStorage || new Map();

class AbstractMemberMethods {
	constructor(member) {
		this.id = member.user.id;
		this.guild = member.guild;
		this.guildid = member.guild.id;
		this.roles = member.roles;
		this.member = member;
		this.user = member.user;
		
		this.updateMethods();
		this.callConstructors();
	}
	
	get uid() {
		return DBot.GetMemberID(this.member);
	}
	
	callConstructors() {
		for (const [key, value] of DBot.MemberConstructors) {
			this['constructor_' + key](this);
		}
	}
	
	updateMethods() {
		for (const [key, value] of DBot.MemberMethods) {
			this[key] = value;
		}
		
		for (const [key, value] of DBot.MemberConstructors) {
			this['constructor_' + key] = value;
		}
	}
	
	toString() {
		return '<@' + this.id + '>';
	}
}

DBot.RegisterMemberMethod = function(name, func) {
	DBot.MemberMethods.set(name, func);
};

DBot.RegisterMemberConstructor = function(name, func) {
	DBot.MemberConstructors.set(name, func);
};

DBot.IMember = function(member) {
	const uid = member.user.id + '___' + member.guild.id;
	
	if (!DBot.MemberStorage.has(uid))
		DBot.MemberStorage.set(uid, new AbstractMemberMethods(member));
	
	return DBot.MemberStorage.get(uid);
};
