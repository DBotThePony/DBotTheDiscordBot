
Util.SafeCopy('./node_modules/moment/moment.js', DBot.WebRoot + '/moment.js');
Util.SafeCopy('./node_modules/numeral/numeral.js', DBot.WebRoot + '/numeral.js');
Util.SafeCopy('./resource/files/jquery-3.0.0.min.js', DBot.WebRoot + '/jquery-3.0.0.min.js');
Util.mkdir(DBot.WebRoot + '/countdown');

var INIT = false;
var NOTIFY = {};

hook.Add('BotOnline', 'Timers', function() {
	INIT = true;
	MySQL.query('SELECT "ID", "STAMP" FROM timers_ids WHERE "NOTIFY" = false', function(err, data) {
		for (var i in data) {
			NOTIFY[data[i].ID] = data[i].STAMP;
		}
	});
});

setInterval(function() {
	if (!INIT)
		return;
	
	var curr = CurTime();
	
	for (var ID in NOTIFY) {
		if (NOTIFY[ID] <= curr) {
			(function() {
				var id = ID;
				
				MySQL.query('UPDATE timers_ids SET "NOTIFY" = true WHERE "ID" = ' + id);
				
				MySQL.query('SELECT "TITLE", "HASH" FROM timers_ids WHERE "ID" = ' + id, function(err, data2) {
					MySQL.query('SELECT "ID" FROM timers_users WHERE "TIMERID" = ' + id, function(err, data) {
						for (var I in data) {
							var row = data[I];
							var user = DBot.GetUser(row.ID);
							
							if (user) {
								user.sendMessage('Timer #' + id + ' "' + data2[0].TITLE + '" has runned out!\n' + DBot.URLRoot + '/countdown/' + data2[0].HASH + '.html');
							}
						}
					});
				});
			})();
			
			NOTIFY[ID] = undefined;
		}
	}
}, 1000);

var crypto = require('crypto');
var fs = require('fs');
var moment = require('moment');

var stuff = [];

stuff[0] = `<!DOCTYPE HTML>
<html>
<head>
<title>Countdown</title>
<style>
body {
	background: black;
	font-family: Arial;
}

#countdown {
	display: block;
	color: white;
	width: 1600px;
	position: absolute;
	left: 50%;
	margin-left: -800px;
	text-align: center;
	top: 50%;
	height: 10px;
	margin-top: -80px;
}

#timer {
	text-align: center;
	display: block;
	position: absolute;
	color: white;
	left: 50%;
	top: 20px;
	width: 800px;
	margin-left: -400px;
	font-size: 48px;
}

#nums {
	font-size: 108px;
}
</style>
<script src='/bot/moment.js'></script>
<script src='/bot/numeral.js'></script>
<script src='/bot/jquery-3.0.0.min.js'></script>
<script type='application/javascript'>`;

stuff[1] = `var countdown;
var nums;

var func = function() {
	countdown = countdown || $('#countdown');
	nums = nums || $('#nums');
	var delta = CountingUntil - (new Date()).getTime() / 1000;
	var valid = delta % 86000;
	var toDays = delta - valid;
	
	var apply = '';
	
	if (toDays > 0) {
		apply = Math.floor(toDays / 86000) + ' days, ';
	}
	
	if (delta > 0)
		nums.html(apply + numeral(valid).format('00:00:00'));
	else {
		nums.html('00:00:00');
		countdown.css('color', 'red');
	}
}
setInterval(func, 1000);
setTimeout(func, 10);
</script>
</head>
<body>`;

stuff[2] = `<span id='countdown'><span id='nums'>00:00:00</span></span>
</body>
</html>`;

module.exports = {
	name: 'timer',
	alias: ['countdown'],
	
	help_args: '<title> <time>',
	desc: 'Creates a timer. When timer runs out, i will notify you in PM.\nAlso generates an HTML page.\nTime parsed by Moment.JS, to see avaliable\nformats of input time, see http://momentjs.com/docs/#/parsing/\nIf you want timer that will alarm in some amount of seconds, just\ninstead of time type number that represents amount of seconds.\nAlso i support values like 1h30m10s (you can use hours instead of h,\nminutes instead of m, seconds instead of s)',
	
	func: function(args, cmd, msg) {
		var title = args[0];
		var time = args[1];
		
		if (!title)
			return 'There must be a title' + Util.HighlightHelp(['timer'], 2, args);
		
		if (!time)
			return 'There is must be time' + Util.HighlightHelp(['timer'], 3, args);
		
		var num = Util.ToNumber(time);
		
		for (var i = 2; i < args.length; i++) {
			time += ' ' + args[i];
		}
		
		var unix;
		
		if (num) {
			unix = CurTime() + num;
		} else {
			var parsed = 0;
			
			var hours = time.match(/[0-9]+(h|hours)/);
			var minutes = time.match(/[0-9]+(m|minutes)/);
			var seconds = time.match(/[0-9]+(s|seconds)/);
			
			if (hours) {
				parsed += Util.ToNumberSoft(hours[0]) * 3600;
			}
			
			if (minutes) {
				parsed += Util.ToNumberSoft(minutes[0]) * 60;
			}
			
			if (seconds) {
				parsed += Util.ToNumberSoft(seconds[0]);
			}
			
			if (parsed == 0) {
				var M;
				
				try {
					M = moment(time);
				} catch(err) {
					
				}
				
				if (!M)
					return 'Invalid time' + Util.HighlightHelp(['timer'], 3, args);
				else
					unix = M.unix();
			} else {
				unix = CurTime() + parsed;
			}
		}
		
		if (unix <= CurTime()) {
			return 'Invalid date!' + Util.HighlightHelp(['timer'], 3, args);
		}
		
		var hash = crypto.createHash('sha256');
		
		hash.update(unix + ' || ');
		hash.update(title);
		
		var sha = hash.digest('hex');
		var fpath = DBot.WebRoot + '/countdown/' + sha + '.html';
		var fpathURL = DBot.URLRoot + '/countdown/' + sha + '.html';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				MySQL.query('SELECT "ID", "STAMP" FROM timers_ids WHERE "HASH" = \'' + sha + '\'', function(err, data) {
					msg.reply('Timer already created: ' + fpathURL);
					
					if (data[0].STAMP > CurTime()) {
						NOTIFY[data[0].ID] = data[0].STAMP;
						MySQL.query('INSERT INTO timers_users VALUES (' + DBot.GetUserID(msg.author) + ', ' + data[0].ID + ') ON CONFLICT DO NOTHING');
					}
				});
			} else {
				MySQL.query('INSERT INTO timers_ids ("TITLE", "STAMP", "HASH", "NOTIFY") VALUES (' + Util.escape(title) + ', ' + unix + ', \'' + sha + '\', false) RETURNING "ID"', function(err, data, originalData) {
					if (err) {
						msg.reply('I just don\'t know what went wrong!');
						console.error(err);
						return;
					}
					
					var timerID = data[0].ID;
					var stream = fs.createWriteStream(fpath);
					
					stream.write(stuff[0]);
					
					stream.write('var CountingUntil = ' + unix + ';\n');
					
					stream.write(stuff[1]);
					stream.write("<span id='timer'>Timer #" + timerID + "<br>" + title + "</span>");
					stream.write(stuff[2]);
					
					stream.end();
					
					MySQL.query('INSERT INTO timers_users VALUES (' + DBot.GetUserID(msg.author) + ', ' + timerID + ') ON CONFLICT DO NOTHING');
					NOTIFY[timerID] = unix;
					
					stream.on('finish', function() {
						msg.reply('Timer ID: ' + timerID + ' ' + fpathURL);
					});
				});
			}
		});
	}
}

DBot.RegisterCommand({
	name: 'timerlist',
	alias: ['countdownlist'],
	
	help_args: '',
	desc: 'Prints all timers bounded to you',
	
	func: function(args, cmd, msg) {
		var id = DBot.GetUserID(msg.author);
		
		MySQL.query('SELECT "TIMERID" FROM timers_users WHERE "ID" = ' + id, function(err, data) {
			var timerz = [];
			
			var continueFunc = function() {
				if (timerz.length == 0) {
					msg.reply('None timers found.');
					return;
				}
				
				var output = '```';
				
				for (var i in timerz) {
					output += 'Timer #' + timerz[i].ID + ' "' + timerz[i].TITLE + '", Will Alarm ' + moment.unix(timerz[i].STAMP).fromNow() + ' ' + DBot.URLRoot + '/countdown/' + timerz[i].HASH + '.html\n';
				}
				
				output += '```';
				msg.reply(output);
			}
			
			var count = 0;
			
			for (var i in data) {
				count++;
				(function() {
					var id2 = data[i].TIMERID;
					
					MySQL.query('SELECT * FROM timers_ids WHERE "ID" = ' + id2 + ' AND "NOTIFY" = false', function(err, data) {
						count--;
						
						if (data && data[0])
							timerz.push(data[0]);
						
						if (count == 0)
							continueFunc();
					});
				})();
			}
		});
	}
});

DBot.RegisterCommand({
	name: 'rtimer',
	alias: ['removetimer'],
	
	help_args: '',
	desc: 'Removes a timer by it\'s ID from your list\nso you don\'t get notified when it runs out',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return 'Must specify timer ID' + Util.HighlightHelp(['rtimer'], 2, args);
		
		var id = DBot.GetUserID(msg.author);
		MySQL.query('SELECT "TIMERID" FROM timers_users WHERE "ID" = ' + id + ' AND "TIMERID" = ' + Util.escape(args[0]), function(err, data) {
			if (data && data[0]) {
				MySQL.query('DELETE FROM timers_users WHERE "ID" = ' + id + ' AND "TIMERID" = ' + Util.escape(args[0]));
				msg.reply('Timer deleted successfully');
			} else {
				msg.reply('No such timer ;n;');
			}
		});
	}
});

