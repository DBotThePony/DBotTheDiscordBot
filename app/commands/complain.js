
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const moment = require('moment');
const humanizeDuration = require('humanize-duration');

const queryToList = 'SELECT *, (SELECT "NAME" FROM servers WHERE servers."ID" = complains."SERVER") as "SERVERNAME", (SELECT "NAME" FROM channels WHERE channels."ID" = complains."CHANNEL") as "CHANNELNAME", (SELECT "NAME" FROM users WHERE users."ID" = complains."USER") as "USERNAME", (SELECT "UID" FROM servers WHERE servers."ID" = complains."SERVER") as "SERVERID", (SELECT "UID" FROM channels WHERE channels."ID" = complains."CHANNEL") as "CHANNELID", (SELECT "UID" FROM users WHERE users."ID" = complains."USER") as "USERID" FROM complains ORDER BY "ID" DESC LIMIT 5';

module.exports = {
	name: 'complain',
	alias: ['feedback', 'suggestion', 'issue', 'bug'],
	
	argNeeded: true,
	failMessage: 'Missing text',
	
	help_args: '<text text text>',
	desc: 'Complain\nComplains are visible to public',
	
	func: function(args, cmd, msg) {
		let uid = DBot.GetUserID(msg.author);
		let cid = -1;
		let sid = -1;
		
		if (!DBot.IsPM(msg)) {
			cid = DBot.GetChannelID(msg.channel);
			sid = DBot.GetServerID(msg.channel.guild);
		}
		
		let stuff = [Postgres.escape(sid), Postgres.escape(cid), Postgres.escape(uid), Postgres.escape(Math.floor(CurTime())), Postgres.escape(cmd)];
		
		Postgres.query('INSERT INTO complains ("SERVER", "CHANNEL", "USER", "STAMP", "CONTENT") VALUES (' + stuff.join(',') + ')');
		
		return 'Complain sended! Yay!\nIf you got an info about generic bot bug or issue, open an issue ticket here: https://git.dbot.serealia.ca/dbot/NotDBot/issues';
	}
}

DBot.RegisterCommand({
	name: 'complains',
	
	help_args: '',
	desc: 'Lists complains',
	
	func: function(args, cmd, msg) {
		Postgres.query(queryToList, function(err, data) {
			let output = '';
			
			for (let row of data) {
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
			
			IMagick.DrawSimpleText(output, function(err, fpath, fpathU) {
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
