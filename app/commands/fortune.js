
const fs = DBot.js.fs;

let categories = [];
let categoriesVulgar = [];
let categoriesFull = [];
let totalCnt = 0;
let totalCntVulgar = 0;
let doneFiles = 2;

// Fill the SQL table!
// Using SQL for stuff that is stored in files because it is better in preformance
// And of course - this consumes much less memory

let updateFullList = function() {
	for (let ct of categories) {
		categoriesFull.push(ct);
	}
	
	for (let ct of categoriesVulgar) {
		if (!Util.HasValue(categoriesFull, ct))
			categoriesFull.push(ct);
	}
}

fs.readdir('./resource/fortune', function(err, files) {
	categories = files;
	doneFiles--;
	
	if (doneFiles == 0) {
		updateFullList;
	}
	
	Postgres.query('SELECT COUNT("ID") as "COUNT" FROM fortune LIMIT 1', function(err, data) {
		if (data && data[0] && data[0].COUNT != 0) {
			totalCnt = Number(data[0].COUNT);
			return;
		}
		
		for (let file of categories) {
			fs.readFile('./resource/fortune/' + file, 'utf8', function(err, data) {
				if (err) {
					console.error(err);
					return;
				}
				
				let phrases = data.split('%');
				let esc = Postgres.escape(file);
				
				totalCnt += phrases.length;
				
				for (let phraseID in phrases) {
					let phr = phrases[phraseID];
					
					Postgres.query('INSERT INTO fortune ("CATEGORY", "CONTENT") VALUES (' + esc + ', ' + Postgres.escape(phr) + ')');
				}
			});
		}
	});
});

fs.readdir('./resource/fortune_vulgar', function(err, files) {
	categoriesVulgar = files;
	doneFiles--;
	
	if (doneFiles == 0) {
		updateFullList;
	}
	
	Postgres.query('SELECT COUNT("ID") as "COUNT" FROM fortune_vulgar LIMIT 1', function(err, data) {
		if (data && data[0] && data[0].COUNT != 0) {
			totalCntVulgar = Number(data[0].COUNT);
			return;
		}
		
		for (let file of categories) {
			fs.readFile('./resource/fortune/' + file, 'utf8', function(err, data) {
				if (err) {
					console.error(err);
					return;
				}
				
				let phrases = data.split('%');
				let esc = Postgres.escape(file);
				
				totalCntVulgar += phrases.length;
				
				for (let phraseID in phrases) {
					let phr = phrases[phraseID];
					
					Postgres.query('INSERT INTO fortune_vulgar ("CATEGORY", "CONTENT") VALUES (' + esc + ', ' + Postgres.escape(phr) + ')');
				}
			});
		}
		
		for (let file of categoriesVulgar) {
			fs.readFile('./resource/fortune_vulgar/' + file, 'utf8', function(err, data) {
				if (err) {
					console.error(err);
					return;
				}
				
				let phrases = data.split('%');
				let esc = Postgres.escape(file);
				
				totalCntVulgar += phrases.length;
				
				for (let phraseID in phrases) {
					let phr = phrases[phraseID];
					
					Postgres.query('INSERT INTO fortune_vulgar ("CATEGORY", "CONTENT") VALUES (' + esc + ', ' + Postgres.escape(phr) + ')');
				}
			});
		}
	});
});

module.exports = {
	name: 'fortune',
	
	more: true,
	help_args: '[category]',
	desc: 'Messages from Cookies!\nCategories list: fortunelist',
	
	func: function(args, cmd, msg) {
		if (!args[0]) {
			Postgres.query('SELECT "CONTENT" FROM fortune WHERE "ID" = ' + MathHelper.Random(1, totalCnt), function(err, data) {
				if (err || !data || !data[0]) {
					return;
				}
				
				msg.reply('```' + data[0].CONTENT + '```');
			});
		} else {
			args[0] = args[0].toLowerCase();
			if (!Util.HasValue(categories, args[0]))
				return DBot.CommandError('Invalid fortune category', 'fortune', args, 1);
			
			Postgres.query('SELECT "CONTENT" FROM fortune WHERE "CATEGORY" = ' + Postgres.escape(args[0]) + ' ORDER BY random() LIMIT 1', function(err, data) {
				if (err || !data || !data[0]) {
					return;
				}
				
				msg.reply('```' + data[0].CONTENT + '```');
			});
		}
	},
}

DBot.RegisterCommand({
	name: 'vfortune',
	alias: ['vulgarfortune', 'fortunev', 'fortunevulgar'],
	
	more: true,
	help_args: '[category]',
	desc: 'Messages from Cookies!\nThis command includes some vulgar stuff\nCategories list: vfortunelist',
	
	func: function(args, cmd, msg) {
		if (!args[0]) {
			Postgres.query('SELECT "CONTENT" FROM fortune_vulgar WHERE "ID" = ' + MathHelper.Random(1, totalCntVulgar), function(err, data) {
				if (err || !data || !data[0]) {
					return;
				}
				
				msg.reply('```' + data[0].CONTENT + '```');
			});
		} else {
			args[0] = args[0].toLowerCase();
			if (!Util.HasValue(categoriesFull, args[0]))
				return DBot.CommandError('Invalid fortune category', 'fortune', args, 1);
			
			Postgres.query('SELECT "CONTENT" FROM fortune_vulgar WHERE "CATEGORY" = ' + Postgres.escape(args[0]) + ' ORDER BY random() LIMIT 1', function(err, data) {
				if (err || !data || !data[0]) {
					return;
				}
				
				msg.reply('```' + data[0].CONTENT + '```');
			});
		}
	},
});

DBot.RegisterCommand({
	name: 'fortunelist',
	
	help_args: '',
	desc: 'Lists fortune categories',
	
	func: function(args, cmd, msg) {
		return 'Avaliable categories are: ```\n' + categories.join(', ') + '\n```';
	},
});

DBot.RegisterCommand({
	name: 'vfortunelist',
	
	help_args: '',
	desc: 'Lists all fortune categories',
	
	func: function(args, cmd, msg) {
		return 'Avaliable categories are: ```\n' + categoriesFull.join(', ') + '\n```';
	},
});
