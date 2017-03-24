
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const fs = require('fs');

const categories = fs.readdirSync('./resource/fortune');
const categoriesVulgar = fs.readdirSync('./resource/fortune_vulgar');
const categoriesFull = [];

const fortuneNormal = [];
const fortuneVulgar = [];
const fortuneFull = [];

const fortuneMapNormal = new Map();
const fortuneMapVulgar = new Map();
const fortuneMapFull = new Map();

for (const cat of categories)
	categoriesFull.push(cat);

for (const cat of categoriesVulgar)
	categoriesFull.push(cat);

for (const file of categories) {
	const data = fs.readFileSync('./resource/fortune/' + file, 'utf8');
	
	const mapData1 = [];
	const mapData2 = [];
	fortuneMapNormal.set(file, mapData1);
	fortuneMapFull.set(file, mapData2);
	
	const phrases = data.split('%');
	
	for (const phr of phrases) {
		fortuneNormal.push(phr);
		mapData1.push(phr);
		fortuneFull.push(phr);
		mapData2.push(phr);
	}
}

for (const file of categoriesVulgar) {
	const data = fs.readFileSync('./resource/fortune_vulgar/' + file, 'utf8');
	
	const mapData1 = [];
	let mapData2;
	fortuneMapVulgar.set(file, mapData1);
	
	if (!fortuneMapFull.has(file)) {
		mapData2 = [];
		fortuneMapFull.set(file, mapData2);
	} else {
		mapData2 = fortuneMapFull.get(file);
	}
	
	const phrases = data.split('%');
	
	for (const phr of phrases) {
		fortuneVulgar.push(phr);
		mapData1.push(phr);
		fortuneFull.push(phr);
		mapData2.push(phr);
	}
}

module.exports = {
	name: 'fortune',
	
	more: true,
	help_args: '[category]',
	desc: 'Messages from Cookies!\nCategories list: fortunelist',
	
	func: function(args, cmd, msg) {
		if (!args[0]) {
			return '```' + Array.Random(fortuneNormal) + '```';
		} else {
			args[0] = args[0].toLowerCase();
			
			if (!categories.includes(args[0]))
				return DBot.CommandError('Invalid fortune category', 'fortune', args, 1);
			
			return '```' + Array.Random(fortuneMapNormal.get(args[0])) + '```';
		}
	}
};

DBot.RegisterCommand({
	name: 'vfortune',
	alias: ['vulgarfortune', 'fortunev', 'fortunevulgar'],
	
	more: true,
	help_args: '[category]',
	desc: 'Messages from Cookies!\nThis command shows only vulgar stuff\nCategories list: vfortunelist',
	
	func: function(args, cmd, msg) {
		if (!args[0]) {
			return '```' + Array.Random(fortuneVulgar) + '```';
		} else {
			args[0] = args[0].toLowerCase();
			
			if (!categoriesVulgar.includes(args[0]))
				return DBot.CommandError('Invalid fortune category', 'fortune', args, 1);
			
			return '```' + Array.Random(fortuneMapVulgar.get(args[0])) + '```';
		}
	}
});

DBot.RegisterCommand({
	name: 'ffortune',
	alias: ['fullfortune'],
	
	more: true,
	help_args: '[category]',
	desc: 'Messages from Cookies!\nThis command includes vulgar and usual stuff\nCategories list: ffortunelist',
	
	func: function(args, cmd, msg) {
		if (!args[0]) {
			return '```' + Array.Random(fortuneFull) + '```';
		} else {
			args[0] = args[0].toLowerCase();
			
			if (!categoriesFull.includes(args[0]))
				return DBot.CommandError('Invalid fortune category', 'fortune', args, 1);
			
			return '```' + Array.Random(fortuneMapFull.get(args[0])) + '```';
		}
	}
});

DBot.RegisterCommand({
	name: 'fortunelist',
	
	help_args: '',
	desc: 'Lists fortune categories',
	
	func: function(args, cmd, msg) {
		return 'Avaliable categories are: ```\n' + categories.join(', ') + '\n```';
	}
});

DBot.RegisterCommand({
	name: 'vfortunelist',
	
	help_args: '',
	desc: 'Lists vulgar fortune categories',
	
	func: function(args, cmd, msg) {
		return 'Avaliable categories are: ```\n' + categoriesVulgar.join(', ') + '\n```';
	}
});

DBot.RegisterCommand({
	name: 'ffortunelist',
	
	help_args: '',
	desc: 'Lists all fortune categories',
	
	func: function(args, cmd, msg) {
		return 'Avaliable categories are: ```\n' + categoriesFull.join(', ') + '\n```';
	}
});
