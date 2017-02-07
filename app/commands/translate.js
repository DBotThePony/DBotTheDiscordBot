
/* global DBot */

if (!DBot.cfg.yandex_tr_enable) return;

const unirest = DBot.js.unirest;
const fs = DBot.js.fs;
const JSON3 = DBot.js.json3;
const apiKey = DBot.cfg.yandex_tr;

let validLangs = [];
let validLangsNames = [];

let alias = {
	rus: 'ru',
	eng: 'en',
	deu: 'de',
};

Util.mkdir(DBot.WebRoot + '/translate', function() {
	fs.stat(DBot.WebRoot + '/translate/langs.json', function(err, stat) {
		if (stat) {
			fs.readFile(DBot.WebRoot + '/translate/langs.json' , 'utf8', function(err, data) {
				let dt = JSON3.parse(data);
				
				for (let lID in dt.langs) {
					let lName = dt.langs[lID];
					
					validLangs.push(lID);
					validLangsNames.push(lName);
				}
				
				console.log('Loaded avaliable translation languages');
			});
		} else {
			unirest.post('https://translate.yandex.net/api/v1.5/tr.json/getLangs')
			.send({
				key: apiKey,
				ui: 'en',
			})
			.end(function(result) {
				if (result.body.code) {
					return;
				}
				
				console.log('Fetched avaliable translation languages');
				
				for (let lID in result.body.langs) {
					let lName = result.body.langs[lID];
					
					validLangs.push(lID);
					validLangsNames.push(lName);
				}
				
				fs.writeFile(DBot.WebRoot + '/translate/langs.json', result.raw_body);
			});
		}
	});
});

module.exports = {
	name: 'translate',
	
	help_args: '<target language> <phrase>',
	desc: 'Translates text. Uses Yandex translate API\nhttps://translate.yandex.ru/\nhttps://tech.yandex.ru/translate/',
	
	delay: 5,
	
	func: function(args, cmd, msg) {
		if (!args[0]) {
			return 'No target language' + Util.HighlightHelp(['translate'], 2, args);
		}
		
		args[0] = args[0].toLowerCase();
		
		if (alias[args[0]]) {
			args[0] = alias[args[0]];
		}
		
		let hit = false;
		
		for (let i in validLangs) {
			if (validLangs[i] == args[0]) {
				hit = true;
				break;
			}
		}
		
		if (!hit) {
			return 'Invalid target language\nTo list all languages type }languages' + Util.HighlightHelp(['translate'], 2, args);
		}
		
		if (!args[1]) {
			return 'There must be at least one phrase' + Util.HighlightHelp(['translate'], 3, args);
		}
		
		if (cmd.length > 200) {
			return 'Too long text! You hurt me ;n;';
		}
		
		let toCheck = '';
		let toTranslate = '';
		
		for (let i = 1; i <= 3; i++) {
			if (!args[i])
				break;
			
			toCheck += ' ' + args[i];
		}
		
		for (let i = 1; i < args.length; i++) {
			toTranslate += ' ' + args[i];
		}
		
		let sha = String.hash(cmd);
		let fpath = DBot.WebRoot + '/translate/' + sha + '.json';
		
		let continueFunc = function(data) {
			msg.channel.stopTyping();
			msg.reply('\n```' + data.text + '```')
		}
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				fs.readFile(fpath, 'utf8', function(err, data) {
					if (err || !data) {
						msg.channel.stopTyping();
						msg.reply('Something went wrong...');
						return;
					}
					
					continueFunc(JSON3.parse(data));
				});
			} else {
				unirest.post('https://translate.yandex.net/api/v1.5/tr.json/detect')
				.send({
					key: apiKey,
					text: toCheck,
					hint: 'ru,en,es,it,de',
				})
				.end(function(result) {
					if (result.body.code != 200) {
						msg.channel.stopTyping();
						msg.reply('Something went wrong...');
						return;
					}
					
					let lang = result.body.lang;
					
					unirest.post('https://translate.yandex.net/api/v1.5/tr.json/translate')
					.send({
						key: apiKey,
						text: toTranslate,
						lang: lang + '-' + args[0],
					})
					.end(function(result) {
						if (result.body.code != 200) {
							msg.channel.stopTyping();
							msg.reply('Something went wrong...');
							return;
						}
						
						fs.writeFile(fpath, result.raw_body, function(err) {
							continueFunc(result.body);
						});
					});
				});
			}
		});
	},
}

DBot.RegisterCommand({
	name: 'languages',
	alias: ['getlangs', 'langs'],
	
	help_args: '',
	desc: 'Lists all avaliable languages in Yandex translate API',
	
	func: function(args, cmd, msg) {
		let output = '```';
		
		for (let i in validLangs) {
			output += '\n' + validLangs[i] + ': ' + validLangsNames[i];
		}
		
		output += '\n```';
		
		msg.author.sendMessage(output);
		
		if (!DBot.IsPM(msg))
			return 'Sended over PM';
	}
});
