
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

Util.mkdir(DBot.WebRoot + '/users');

const crypto = require('crypto');
const fs = require('fs');
const moment = require('moment');
const hDuration = require('humanize-duration');

const Perms = [
	'CREATE_INSTANT_INVITE',
	'KICK_MEMBERS',
	'BAN_MEMBERS',
	'ADMINISTRATOR',
	'MANAGE_CHANNELS',
	'MANAGE_GUILD',
	'ADD_REACTIONS', // add reactions to messages
	'READ_MESSAGES',
	'SEND_MESSAGES',
	'SEND_TTS_MESSAGES',
	'MANAGE_MESSAGES',
	'EMBED_LINKS',
	'ATTACH_FILES',
	'READ_MESSAGE_HISTORY',
	'MENTION_EVERYONE',
	'EXTERNAL_EMOJIS', // use external emojis
	'CONNECT', // connect to voice
	'SPEAK', // speak on voice
	'MUTE_MEMBERS', // globally mute members on voice
	'DEAFEN_MEMBERS', // globally deafen members on voice
	'MOVE_MEMBERS', // move member's voice channels
	'USE_VAD', // use voice activity detection
	'CHANGE_NICKNAME',
	'MANAGE_NICKNAMES', // change nicknames of others
	'MANAGE_ROLES_OR_PERMISSIONS',
	'MANAGE_WEBHOOKS',
	'MANAGE_EMOJIS'
];

const PermsNames = [
	'Create instant invations',
	'Kick users',
	'Ban users',
	'Is Administrator of the server',
	'Can manipulate channels settings',
	'Can manipulate server settings',
	'Can react to messages', // add reactions to messages
	'Can read messages',
	'Can send messages',
	'Can send Text-To-Speech messages',
	'Can manipulate messages',
	'Can embed links to messages',
	'Can attach files',
	'Can read message history',
	'Can mention everyone (@everyone)',
	'Can use external emoji', // use external emojis
	'Can connect to a voice channel', // connect to voice
	'Can speak in voice channel', // speak on voice
	'Can mute members in voice chats', // globally mute members on voice
	'Can deafen members in voice chats', // globally deafen members on voice
	'Can move members in voice chats', // move member's voice channels
	'Can use VoiceActivityDetection', // use voice activity detection
	'Can change nickname',
	'Can manipulate nicknames', // change nicknames of others
	'Can manipulate roles',
	'Can manipulate Web Hooks',
	'Can change custom server emoji'
];

const sorter = function(a, b) {
	if (a.immunity === 'lol')
		return -1;
	
	if (b.immunity === 'lol')
		return 1;
	
	if (a.immunity > b.immunity)
		return -1;
	
	if (a.immunity < b.immunity)
		return 1;
	
	return 0;
};

module.exports = {
	name: 'users',
	
	help_args: '',
	desc: 'Builds HTML page with users on current server',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		const sha = String.hash(CurTime() + '_' + msg.channel.guild.id);
		const path = DBot.WebRoot + '/users/' + sha + '.html';
		const pathU = DBot.URLRoot + '/users/' + sha + '.html';
		
		let data = [];
		
		for (const member of msg.channel.guild.members.values()) {
			let cData = {};
			
			cData.name = member.user.username;
			cData.nname = member.nickname;
			cData.avatar = member.user.avatarURL || '../no_avatar.jpg';
			cData.roles = member.roles.array();
			let max = 0;
			let hexColor;
			let roleName;
			
			for (const role of member.roles.values()) {
				if (role.position > max) {
					max = role.position;
					hexColor = role.hexColor;
					roleName = role.name;
				}
			}
			
			cData.role = roleName;
			cData.hexcolor = hexColor;
			cData.joinedat = moment(member.joinedTimestamp).format('dddd, MMMM Do YYYY, HH:mm');
			cData.join_duration = hDuration(Math.floor(CurTime() - member.joinedTimestamp / 1000) * 1000) + ' ago';
			
			if (member.id === member.guild.owner.id)
				cData.immunity = 'lol';
			else
				cData.immunity = max;
			
			cData.perms = [];
			for (const i in Perms) {
				const id = Perms[i];
				const desc = PermsNames[i];
				
				if (member.hasPermission(id))
					cData.perms.push(desc);
			}
			
			data.push(cData);
		}
		
		data.sort(sorter);
		
		fs.writeFile(path, DBot.pugRender('users.pug', {
			data: data,
			total: msg.channel.guild.memberCount,
			listed: msg.channel.guild.members.size,
			date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
			username: msg.author.username,
			server: msg.channel.guild.name,
			title: 'Users on ' + msg.channel.guild.name
		}), console.errHandler);
		
		msg.reply(pathU);
		msg.channel.stopTyping();
	}
};
