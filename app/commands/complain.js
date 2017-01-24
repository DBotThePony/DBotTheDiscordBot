
const moment = DBot.js.moment;
const humanizeDuration = DBot.js.hDuration;

const queryToList = 'SELECT *, (SELECT "NAME" FROM server_names WHERE server_names."ID" = complains."SERVER") as "SERVERNAME", (SELECT "NAME" FROM channel_names WHERE channel_names."ID" = complains."CHANNEL") as "CHANNELNAME", (SELECT "USERNAME" FROM user_names WHERE user_names."ID" = complains."USER") as "USERNAME", (SELECT "UID" FROM server_id WHERE server_id."ID" = complains."SERVER") as "SERVERID", (SELECT "UID" FROM channel_id WHERE channel_id."ID" = complains."CHANNEL") as "CHANNELID", (SELECT "UID" FROM user_id WHERE user_id."ID" = complains."USER") as "USERID" FROM complains ORDER BY "ID" DESC LIMIT 5';

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
		
		var stuff = [Util.escape(sid), Util.escape(cid), Util.escape(uid), Util.escape(Math.floor(CurTime())), Util.escape(cmd)];
		
		MySQL.query('INSERT INTO complains ("SERVER", "CHANNEL", "USER", "STAMP", "CONTENT") VALUES (' + stuff.join(',') + ')');
		
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
				output += '\nUser: ' + row.USERNAME + ' <@' + row.USERID.trim() + '>';
				output += '\nDate: ' + date.format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + humanizeDuration(Math.floor((CurTime() * 1000 - row.STAMP * 1000) / 1000) * 1000) + ' ago)';
				
				if (row.SERVERNAME) {
					output += '\nServer: ' + row.SERVERNAME + ' <' + row.SERVERID.trim() + '>';
				}
				
				if (row.CHANNELNAME) {
					output += '\nChannel: ' + row.CHANNELNAME + ' <#' + row.CHANNELID.trim() + '>';
				}
				
				output += '\nMessage: \n\t' + row.CONTENT.replace(/\n/gi, '\n\t') + '\n\n';
			}
			
			DrawText(output, function(err, fpath, fpathU) {
				if (err) {
					msg.reply('Failed to draw complains!');
					return;
				}
				
				msg.author.sendMessage(fpathU);
			}, 24);
			
			if (!DBot.IsPM(msg))
				msg.reply('Sended over PM');
		});
	}
});
