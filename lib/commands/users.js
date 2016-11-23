
Util.SafeCopy('./node_modules/moment/moment.js', DBot.WebRoot + '/moment.js');
Util.SafeCopy('./node_modules/numeral/numeral.js', DBot.WebRoot + '/numeral.js');
Util.SafeCopy('./resource/jquery-3.0.0.min.js', DBot.WebRoot + '/jquery-3.0.0.min.js');
Util.mkdir(DBot.WebRoot + '/users');

var crypto = require('crypto');
var fs = require('fs');

var PERM_ENUMS = [
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

module.exports = {
	name: 'users',
	
	help_args: '',
	desc: 'Builds HTML page with users on current server',
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		var users = msg.channel.guild.members.array();
		
		var hash = crypto.createHash('sha256');
		
		for (var i in users) {
			hash.update(users[i].user.id);
			hash.update(Util.Concat(users[i].roles, '||'));
			
			if (users[i].user.avatarURL) {
				hash.update(users[i].user.avatarURL);
			}
		}
		
		var sha = hash.digest('hex');
		
		fs.stat(DBot.WebRoot + '/users/' + sha + '.html', function(err, stat) {
			if (stat) {
				msg.reply(DBot.URLRoot + '/users/' + sha + '.html');
			} else {
				var stream = fs.createWriteStream(DBot.WebRoot + '/users/' + sha + '.html');
				
				stream.write("<!DOCTYPE HTML><html><head><title>Users Report</title><link href='/bot/users.css' type='text/css' rel='stylesheet' /></head><body><span id='totalusers'>Total users: " + users.length + "</span><table><tr id='top'><td>AVATAR</td><td>USERNAME</td><td>USER ID</td><td>TEXT TO MENTION USER</td><td>ROLES AND PERMISSIONS</td></tr>");
				
				for (var i in users) {
					var member = users[i];
					var user = users[i].user;
					var perms = users[i].permissions;
					
					var av;
					
					if (user.avatarURL)
						av = '<img src="' + user.avatarURL + '" />';
					else
						av = 'User have no avatar';
					
					stream.write('<tr>');
					
					stream.write('<td class="avatar">' + av + '</td><td class="username">' + user.username + '</td><td class="userid">' + user.id + '</td><td class="userid_mention"><@' + user.id + '></td><td class="roles">ROLES:');
					
					var roles = member.roles.array();
					
					for (var roleID in roles) {
						var role = roles[roleID];
						stream.write('<span class="rolename" style="color: ' + role.hexColor + '">' + role.name + '</span> ');
					}
					
					stream.write('<br><span class="perms">');
					
					var line = false;
					
					for (var i in PERM_ENUMS) {
						if (line) {
							stream.write('<span class="oddline">');
						} else {
							stream.write('<span class="eddline">');
						}
						
						line = !line;
						
						if (member.hasPermission(PERM_ENUMS[i])) {
							stream.write(PERM_ENUMS[i] + ': <span class="permstat">Yes</span></span>');
						} else {
							stream.write(PERM_ENUMS[i] + ': <span class="permstat">No</span></span>');
						}
					}
					
					stream.write('</span></td></tr>');
				}
				
				stream.write('</table></body></html>');
				stream.end();
				
				stream.on('finish', function() {
					msg.reply(DBot.URLRoot + '/users/' + sha + '.html');
				});
			}
		});
	},
}
