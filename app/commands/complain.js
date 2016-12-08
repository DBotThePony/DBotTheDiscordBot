
const utf8 = require('utf8');
const moment = require('moment');
const humanizeDuration = require('humanize-duration');

const queryToList = 'SELECT *, (SELECT "NAME" FROM server_names WHERE "server_names"."ID" = "complains"."SERVER") as "SERVERNAME", (SELECT "NAME" FROM channel_names WHERE "channel_names"."ID" = "complains"."CHANNEL") as "CHANNELNAME", (SELECT "USERNAME" FROM user_names WHERE "user_names"."ID" = "complains"."USER") as "USERNAME", (SELECT "UID" FROM server_id WHERE "server_id"."ID" = "complains"."SERVER") as "SERVERID", (SELECT "UID" FROM channel_id WHERE "channel_id"."ID" = "complains"."CHANNEL") as "CHANNELID", (SELECT "UID" FROM user_id WHERE "user_id"."ID" = "complains"."USER") as "USERID" FROM complains ORDER BY "ID" DESC LIMIT 0, 5';

module.exports = {
	name: 'complain',
	
	argNeeded: true,
	failMessage: 'Missing text',
	
	help_args: '<text text text>',
	desc: 'Complain\nComplains are visible to public',
	
	func: function(args, cmd, msg) {
		var uid = DBot.GetUserID(msg.author);
		var cid = -1;
		var sid = -1;
		
		if (!DBot.IsPM(msg)) {
			cid = DBot.GetChannelID(msg.channel);
			sid = DBot.GetServerID(msg.channel.guild);
		}
		
		var stuff = [MySQL.escape(sid), MySQL.escape(cid), MySQL.escape(uid), MySQL.escape(CurTime()), MySQL.escape(utf8.encode(cmd))];
		
		MySQL.query('INSERT INTO "complains" VALUES (NULL, ' + stuff.join(',') + ')');
		
		return 'Complain sended! Yay!';
	}
}

DBot.RegisterCommand({
	name: 'complains',
	
	help_args: '',
	desc: 'Lists complains',
	
	func: function(args, cmd, msg) {
		MySQL.query(queryToList, function(err, data) {
			var output = '';
			
			for (let i in data) {
				let row = data[i];
				let date = moment.unix(row.STAMP);
				
				output += '\nComplain ID: ' + row.ID;
				output += '\nUser: ' + row.USERNAME + ' <@' + row.USERID + '>';
				output += '\nDate: ' + date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + humanizeDuration(Math.floor((CurTime() * 1000 - row.STAMP * 1000) / 1000) * 1000) + ' ago)';
				
				if (row.SERVERNAME) {
					output += '\nServer: ' + row.SERVERNAME + ' <' + row.SERVERID + '>';
				}
				
				if (row.CHANNELNAME) {
					output += '\nChannel: ' + row.CHANNELNAME + ' <#' + row.CHANNELID + '>';
				}
				
				output += '\nMessage: \n```\n' + row.CONTENT + '\n```';
			}
			
			msg.author.sendMessage(output);
			
			if (!DBot.IsPM(msg))
				msg.reply('Sended over PM');
		});
	}
});
