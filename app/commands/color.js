
/* global FCVAR_BOOLONLY */

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const avaliableColors = [ // Colours
	['Red', '#ff0000'],
	['Green', '#00B000'],
	['Lime', '#00ff00'],
	['Blue', '#0000ff'],
	['Emerald', '#2ecc71'],
	['Amethyst', '#9b59b6'],
	['Clouds', '#ecf0f1'],
	['DarkGreen', '#16a085'],
	['Carrot', '#e67e22'],
	['Silver', '#bdc3c7'],
	['Black', '#010101'],
	['Pink', '#FFC0CB'],
	['Lavender', '#E6E6FA'],
	['Violet', '#EE82EE'],
	['MediumPurple', '#9370DB'],
	['Purple', '#800080'],
	['Salmon', '#FA8072'],
	['Gold', '#FFD700'],
	['DarkGold', '#BDB76B'],
	['DarkCyan', '#008B8B'],
	['Cyan', '#00FFFF'],
	['DarkGreen', '#006400'],
	['SteelBlue', '#4682B4'],
	['Brown', '#8B4513'],
	['Peru', '#CD853F'],
	['LightGrey', '#D3D3D3'],
	['Orange', '#FFA500'],
	['Grey', '#808080']
];

const avaliableColorsMap = {};
let validColorsString;

for (const r of avaliableColors) {
	avaliableColorsMap[r[0].toLowerCase()] = r[0];
	if (validColorsString)
		validColorsString += ', ' + r[0];
	else
		validColorsString = r[0];
}

cvars.ServerVar('colors', '0', [FCVAR_BOOLONLY], 'Enable bot colors. Requires Role manipulation permissions!');

const registerColorRoles = function(server, callback) {
	let toCreate = [];
	
	for (const roleData of avaliableColors) {
		const roleName = roleData[0].toLowerCase();
		let hit = false;
		
		for (const role of server.roles.array()) {
			if (role.name.toLowerCase() === roleName) {
				hit = true;
				break;
			}
		}
		
		if (!hit)
			toCreate.push(roleData);
	}
	
	if (toCreate.length === 0) {
		if (callback) callback();
		return;
	}
	
	let finished = 0;
	
	for (const data of toCreate) {
		server.createRole({
			name: data[0],
			color: data[1],
			position: 0,
			mentionable: false,
			hoist: false
		})
		.then(() => {
			finished++;

			if (finished === toCreate.length)
				if (callback) callback();
		})
		.catch(console.error);
	}
};

module.exports = {
	name: 'color',
	
	help_args: '<color name>',
	desc: 'Change your color\nValid colors are: ' + validColorsString,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;-; Lonely';
		
		if (!cvars.Server(msg.channel.guild).getVar('colors').getBool())
			return 'Colors are not enabled on this server';
		
		if (!msg.channel.guild.member(DBot.bot.user).hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'Server administrator has done invalid setup - Colors are enabled but i don\'t have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		let currRoleColor;
		
		for (const role of msg.member.roles.values())
			if (avaliableColorsMap[role.name.toLowerCase()]) currRoleColor = role;
		
		if (!args[0])
			return DBot.CommandError('No color specified', 'color', args, 1);
		
		const col = args[0].toLowerCase();
		if (!avaliableColorsMap[col])
			return DBot.CommandError('Invalid color specified', 'color', args, 1);
		
		let targetRole;
		
		const findRole = function() {
			for (const role of msg.channel.guild.roles.values()) {
				if (role.name.toLowerCase() === col) {
					targetRole = role;
					break;
				}
			}
		};
		
		findRole();
		
		if (currRoleColor)
			if (targetRole && targetRole.id === currRoleColor.id)
				return 'You already have this color!';
			else
				msg.member.removeRole(currRoleColor);
		
		msg.channel.startTyping();
		const continueFunc = function() {
			if (!targetRole) findRole();
			msg.member.addRole(targetRole);
			msg.sendMessage(`Added color \`${col}\` to <@${msg.author.id}>`);
			msg.channel.stopTyping();
		};
		
		if (!targetRole)
			registerColorRoles(msg.channel.guild, continueFunc);
		else
			continueFunc();
	}
};

DBot.RegisterCommand({
	name: 'reloadcolor',
	alias: ['reloadcolors'],
	
	help_args: '',
	desc: 'Forcefully recreates (missing) color roles on the server',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;-; Lonely';
		
		if (!msg.member.hasPermission('MANAGE_ROLES_OR_PERMISSIONS') && !DBot.owners.includes(msg.author.id))
			return 'You must have `MANAGE_ROLES_OR_PERMISSIONS` permission! ;n;';
		
		if (!msg.channel.guild.member(DBot.bot.user).hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'I must have `MANAGE_ROLES_OR_PERMISSIONS` permission! ;n;';
		
		msg.channel.startTyping();
		registerColorRoles(msg.channel.guild, () => {msg.sendMessage('Done'); msg.channel.stopTyping();});
	}
});

DBot.RegisterCommand({
	name: 'removecolor',
	alias: ['deletecolor'],
	
	help_args: '',
	desc: 'Removes any color from you',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;-; Lonely';
		
		if (!cvars.Server(msg.channel.guild).getVar('colors').getBool())
			return 'Colors are not enabled on this server';
		
		if (!msg.channel.guild.member(DBot.bot.user).hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'Server administrator has done invalid setup - Colors are enabled but i don\'t have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		let currRoleColor;
		
		for (const role of msg.member.roles.values()) {
			if (avaliableColorsMap[role.name.toLowerCase()]) {
				msg.member.removeRole(role);
				msg.sendMessage(`Removed color \`${role.name}\` from <@${msg.author.id}>`);
				return;
			}
		}
		
		msg.sendMessage('You have no any color roles!');
	}
});

cvars.hook.server.add('colors', (session, cvar, oldVal, newVal) => {
	if (cvar.getBool() && session.obj.member(DBot.bot.user).hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
		registerColorRoles(session.obj);
});
