
const unirest = require('unirest');
const fs = require('fs');
const JSON3 = require('json3');
var apiKey = 'trnsl.1.1.20161127T134540Z.02165681560fc8c8.fa36e3a21cf74adf636c739e24b2c78e17b66425';

var validLangs = [];
var validLangsNames = [];

Util.mkdir(DBot.WebRoot + '/translate', function() {
	fs.stat(DBot.WebRoot + '/translate/langs.json', function(err, stat) {
		if (stat) {
			fs.readFile(DBot.WebRoot + '/translate/langs.json' , 'utf8', function(err, data) {
				var dt = JSON3.parse(data);
				
				for (let lID in dt.langs) {
					var lName = dt.langs[lID];
					
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
					var lName = result.body.langs[lID];
					
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
	
	func: function(args, cmd, rawcmd, msg) {
		if (!args[0]) {
			return 'No target language' + Util.HighlightHelp(['translate'], 2, args);
		}
		
		args[0] = args[0].toLowerCase();
		
		var hit = false;
		
		for (let i in validLangs) {
			if (validLangs[i] == args[0]) {
				hit = true;
				break;
			}
		}
		
		if (!hit) {
			return 'Invalid target language' + Util.HighlightHelp(['translate'], 2, args);
		}
		
		if (!args[1]) {
			return 'There must be at least one phrase' + Util.HighlightHelp(['translate'], 3, args);
		}
		
		if (cmd.length > 200) {
			return 'Too long text! You hurt me ;n;';
		}
		
		var toCheck = '';
		var toTranslate = '';
		
		for (let i = 1; i <= 3; i++) {
			if (!args[i])
				break;
			
			toCheck += ' ' + args[i];
		}
		
		for (let i = 1; i < args.length; i++) {
			toTranslate += ' ' + args[i];
		}
		
		var sha = DBot.HashString(cmd);
		var fpath = DBot.WebRoot + '/translate/' + sha + '.json';
		
		var continueFunc = function(data) {
			msg.reply('\n```' + data.text + '```')
		}
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				fs.readFile(fpath, 'utf8', function(err, data) {
					if (err || !data) {
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
						msg.reply('Something went wrong...');
						return;
					}
					
					var lang = result.body.lang;
					
					unirest.post('https://translate.yandex.net/api/v1.5/tr.json/translate')
					.send({
						key: apiKey,
						text: toTranslate,
						lang: lang + '-' + args[0],
					})
					.end(function(result) {
						if (result.body.code != 200) {
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