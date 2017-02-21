
/* global DBot */

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
