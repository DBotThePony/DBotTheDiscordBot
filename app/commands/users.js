
Util.SafeCopy('./node_modules/moment/moment.js', DBot.WebRoot + '/moment.js');
Util.SafeCopy('./node_modules/numeral/numeral.js', DBot.WebRoot + '/numeral.js');
Util.SafeCopy('./resource/files/jquery-3.0.0.min.js', DBot.WebRoot + '/jquery-3.0.0.min.js');
Util.SafeCopy('./resource/files/noavatar.jpg', DBot.WebRoot + '/no_avatar.jpg');
Util.mkdir(DBot.WebRoot + '/users');

let crypto = require('crypto');
let fs = require('fs');

let PERM_ENUMS = [
	"CREATE_INSTANT_INVITE",
	"KICK_MEMBERS",
	"BAN_MEMBERS",
	"ADMINISTRATOR",
	"MANAGE_CHANNELS",
	"MANAGE_GUILD",
	"MANAGE_MESSAGES",
	"EMBED_LINKS",
	"ATTACH_FILES",
	"MENTION_EVERYONE",
	"EXTERNAL_EMOJIS", // use external emojis
	"SPEAK", // speak on voice
	"MUTE_MEMBERS", // globally mute members on voice
	"DEAFEN_MEMBERS", // globally deafen members on voice
	"MOVE_MEMBERS", // move member's voice channels
	"USE_VAD", // use voice activity detection
	"MANAGE_NICKNAMES", // change nicknames of others
	"MANAGE_ROLES_OR_PERMISSIONS"
];

let PERM_ENUMS_TEXT = [
	"Create instant invite",
	"Kick members",
	"Ban members",
	"Administrator (full rights to everything)",
	"Manipulate channels",
	"Manipulate server",
	"Manipulate messages",
	"Embed links",
	"Attach files to messages",
	"Mention @everyone",
	"Use external emoji", // use external emojis
	"SPEAK", // speak on voice
	"Mute member's voice", // globally mute members on voice
	"Deafen members", // globally deafen members on voice
	"Manipulate voice members", // move member's voice channels
	"Use voice activity detection", // use voice activity detection
	"Manipulate nicknames", // change nicknames of others
	"Manipulate roles"
];

module.exports = {
	name: 'users',
	
	help_args: '',
	desc: 'Builds HTML page with users on current server',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		msg.channel.startTyping();
		
		try {
			let users = msg.channel.guild.members.array();
			
			let sha = DBot.HashString(CurTime() + '_' + msg.channel.guild.id);
			
			let stream = fs.createWriteStream(DBot.WebRoot + '/users/' + sha + '.html');
			
			stream.write("<!DOCTYPE HTML><html><head><title>Users Report</title><link href='../users.css' type='text/css' rel='stylesheet' /></head><body><span id='totalusers'>Total users: " + (!msg.channel.guild.large && users.length || '~' + users.length) + "</span><table><tr id='top'><td>AVATAR</td><td>USERNAME</td><td>USER ID</td><td>TEXT TO MENTION USER</td><td>ROLES AND PERMISSIONS</td></tr>");
			
			for (let i in users) {
				let member = users[i];
				let user = users[i].user;
				let perms = users[i].permissions;
				
				let av;
				
				if (user.avatarURL)
					av = '<img src="' + user.avatarURL + '" />';
				else
					av = '<img src="../no_avatar.jpg" />';
				
				stream.write('<tr id="user_' + user.id + '">');
				
				stream.write('<td class="avatar">' + av + '</td><td class="username">' + user.username + '</td><td class="userid">' + user.id + '</td><td class="userid_mention"><@' + user.id + '></td><td class="roles">');
				
				let roles = member.roles.array();
				let roleHit = false;
				
				for (let roleID in roles) {
					let role = roles[roleID];
					if (role.name == '@everyone')
						continue;
					
					if (!roleHit) {
						stream.write('ROLES:');
						roleHit = true;
					}
					
					stream.write('<span class="rolename" style="color: ' + role.hexColor + '">' + role.name + '</span> ');
				}
				
				stream.write('<br><span class="perms">');
				
				let line = false;
				
				for (let i in PERM_ENUMS) {
					if (line) {
						stream.write('<span class="oddline">');
					} else {
						stream.write('<span class="eddline">');
					}
					
					line = !line;
					
					if (member.hasPermission(PERM_ENUMS[i])) {
						stream.write(PERM_ENUMS_TEXT[i] + ': <span class="permstat">Yes</span></span>');
					} else {
						stream.write(PERM_ENUMS_TEXT[i] + ': <span class="permstat">No</span></span>');
					}
				}
				
				stream.write('</span></td></tr>');
			}
			
			stream.write('</table></body></html>');
			stream.end();
			
			stream.on('finish', function() {
				msg.channel.stopTyping();
				msg.reply(DBot.URLRoot + '/users/' + sha + '.html');
			});
		} catch(err) {
			msg.channel.stopTyping();
			throw err;
		}
	},
}
