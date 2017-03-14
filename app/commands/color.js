
/* global FCVAR_BOOLONLY, FCVAR_NUMERSONLY_INT */

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

const additionalColors = [
	['LightYellow', '#FFFFE0'],
	['Khaki', '#F0E68C'],
	['LimeGreen', '#32CD32'],
	['Pumpkin', '#d35400'],
	['SunFlower', '#f1c40f'],
	['SeaGreen', '#2E8B57'],
	['ForestGreen', '#228B22'],
	['OliveGreen', '#6B8E23'],
	['Olive', '#808000'],
	['DarkOlive', '#556B2F'],
	['Teal', '#008080'],
	['SkyBlue', '#87CEEB'],
	['PowderBlue', '#B0E0E6'],
	['LightSkyBlue', '#87CEFA'],
	['DeepSkyBlue', '#00BFFF'],
	['RoyalBlue', '#4169E1'],
	['DarkGoldenRod', '#B8860B'],
	['Chocolate', '#D2691E'],
	['Sienna', '#A0522D'],
	['SandyBrown', '#F4A460'],
	['GoldenRod', '#DAA520'],
	['SlateGrey', '#708090'],
	['Gainsboro', '#DCDCDC'],
	['Coral', '#FF7F50'],
	['DarkOrange', '#FF8C00'],
	['Crimson', '#DC143C'],
	['DarkSalmon', '#E9967A'],
	['DarkRed', '#8B0000'],
	['FireBrick', '#B22222'],
	['DarkMagenta', '#8B008B'],
	['MediumSlateBlue', '#7B68EE'],
	['Indigo', '#4B0082'],
	['Orchid', '#DA70D6'],
	['MediumOrchid', '#BA55D3'],
	['Fuchsia', '#FF00FF'],
	['DarkViolet', '#9400D3'],
	['DeepPink', '#FF1493'],
	['HotPink', '#FF69B4'],
	['Thistle', '#D8BFD8'],
	['PaleVioletRed', '#DB7093'],
	['LavenderRose', '#FF9FF7']
];

const avaliableColorsMap = {};
const avaliableColorsMapAdditional = {};
let validColorsString;
let validColorsString2;

for (const r of avaliableColors) {
	avaliableColorsMap[r[0].toLowerCase()] = r[0];
	if (validColorsString)
		validColorsString += ', ' + r[0];
	else
		validColorsString = r[0];
}

for (const r of additionalColors) {
	avaliableColorsMapAdditional[r[0].toLowerCase()] = r[0];
	
	if (validColorsString2)
		validColorsString2 += ', ' + r[0];
	else
		validColorsString2 = r[0];
}

cvars.ServerVar('colors', '0', [FCVAR_BOOLONLY], 'Enable bot colors. Requires Role manipulation permissions!');
cvars.ServerVar('colors_position', '1', [FCVAR_NUMERSONLY_INT], 'Position of color role');
cvars.ServerVar('colors_additional', '0', [FCVAR_BOOLONLY], 'Enable additional colors');

const registerColorRoles = function(server, callback) {
	const toCreate = [];
	const nPosition = cvars.Server(server).getVar('colors_position').getInt();
	
	for (const roleData of avaliableColors) {
		const roleName = roleData[0].toLowerCase();
		let hit = false;
		
		for (const role of server.roles.values()) {
			if (role.name.toLowerCase() === roleName) {
				if (role.position !== nPosition) role.setPosition(nPosition);
				if (role.hexColor !== roleData[1]) role.setColor(roleData[1]);
				hit = true;
				break;
			}
		}
		
		if (!hit)
			toCreate.push(roleData);
	}
	
	if (cvars.Server(server).getVar('colors_additional').getBool()) {
		for (const roleData of additionalColors) {
			const roleName = roleData[0].toLowerCase();
			let hit = false;

			for (const role of server.roles.values()) {
				if (role.name.toLowerCase() === roleName) {
					if (role.position !== nPosition) role.setPosition(nPosition);
					if (role.hexColor !== roleData[1]) role.setColor(roleData[1]);
					hit = true;
					break;
				}
			}

			if (!hit)
				toCreate.push(roleData);
		}
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
			position: nPosition,
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
	desc: `Change your color\nValid colors are: ${validColorsString}\nIf additional colors are enabled: ${validColorsString2}`,
	nopm: true,
	
	func: function(args, cmd, msg) {
		if (!cvars.Server(msg.channel.guild).getVar('colors').getBool())
			return 'Colors are not enabled on this server';
		
		if (!msg.channel.guild.member(DBot.bot.user).hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
			return 'Server administrator has done invalid setup - Colors are enabled but i don\'t have `MANAGE_ROLES_OR_PERMISSIONS` permission!';
		
		if (!args[0])
			return DBot.CommandError('No color specified', 'color', args, 1);
		
		const col = args[0].toLowerCase();
		const additionalColorsEnabled = cvars.Server(msg.channel.guild).getVar('colors_additional').getBool();
		
		if (!avaliableColorsMap[col] || additionalColorsEnabled && !avaliableColorsMapAdditional[col])
			return DBot.CommandError('Invalid color specified', 'color', args, 1);
		
		let currRoleColor;
		
		for (const role of msg.member.roles.values())
			if (avaliableColorsMap[role.name.toLowerCase()] || avaliableColorsMapAdditional[role.name.toLowerCase()]) currRoleColor = role;
		
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
		registerColorRoles(msg.channel.guild, () => {msg.reply('Done'); msg.channel.stopTyping();});
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
			if (avaliableColorsMap[role.name.toLowerCase()] || avaliableColorsMapAdditional[role.name.toLowerCase()]) {
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
