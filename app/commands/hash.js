
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
