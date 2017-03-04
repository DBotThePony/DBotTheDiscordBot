
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

if (!DBot.cfg.yandex_tr_enable) return;

const unirest = require('unirest');
const fs = require('fs');
const JSON3 = require('json3');
const apiKey = DBot.cfg.yandex_tr;

let validLangs = [];
let validLangsNames = [];

const alias = {
	rus: 'ru',
	eng: 'en',
	deu: 'de'
};

fs.stat(DBot.WebRoot + '/yandex_langs.json', function(err, stat) {
	if (stat) {
		fs.readFile(DBot.WebRoot + '/yandex_langs.json' , 'utf8', function(err, data) {
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
			ui: 'en'
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

			fs.writeFile(DBot.WebRoot + '/yandex_langs.json', result.raw_body);
		});
	}
});

module.exports = {
	name: 'translate',
	
	help_args: '<target language> <phrase>',
	desc: 'Translates text. Uses Yandex translate API\nhttps://translate.yandex.ru/\nhttps://tech.yandex.ru/translate/',
	
	delay: 5,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('Invalid target language\nTo list all languages type }languages', 'translate', args, 1);
		
		args[0] = args[0].toLowerCase();
		
		if (alias[args[0]]) {
			args[0] = alias[args[0]];
		}
		
		let hit = false;
		
		for (let i in validLangs) {
			if (validLangs[i] === args[0]) {
				hit = true;
				break;
			}
		}
		
		if (!hit)
			return DBot.CommandError('Invalid target language\nTo list all languages type }languages', 'translate', args, 1);
		
		if (!args[1])
			return DBot.CommandError('There must be at least one phrase', 'translate', args, 2);
		
		if (cmd.length > 200)
			return 'Too long text! You hurt me ;n;';
		
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
		
		const continueFunc = function(text) {
			msg.channel.stopTyping();
			msg.reply('\n```' + text + '```');
		};
		
		msg.channel.startTyping();
		
		Postgres.query(`SELECT "translation" FROM translate_cache WHERE "source" = '${sha}'`, function(err, data) {
			const getFunc = function() {
				unirest.post('https://translate.yandex.net/api/v1.5/tr.json/detect')
				.send({
					key: apiKey,
					text: toCheck,
					hint: 'ru,en,es,it,de'
				})
				.end(function(result) {
					if (result.body.code !== 200) {
						msg.channel.stopTyping();
						msg.reply('Something went wrong...');
						return;
					}
					
					let lang = result.body.lang;
					
					unirest.post('https://translate.yandex.net/api/v1.5/tr.json/translate')
					.send({
						key: apiKey,
						text: toTranslate,
						lang: lang + '-' + args[0]
					})
					.end(function(result) {
						if (result.body.code !== 200) {
							msg.channel.stopTyping();
							msg.reply('Something went wrong...');
							return;
						}
						
						Postgres.query(`INSERT INTO translate_cache VALUES('${sha}', ${Postgres.escape(result.body.text)})`);
						continueFunc(result.body.text);
					});
				});
			};
			
			if (data.empty(getFunc)) return;
			continueFunc(data.seek().translation);
		});
	}
};

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
			return 'Sent over PM';
	}
});
