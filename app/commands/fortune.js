
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

myGlobals.__fortune = {};

myGlobals.__fortune.categoriesFull = [];

myGlobals.__fortune.fortuneNormal = [];
myGlobals.__fortune.fortuneVulgar = [];
myGlobals.__fortune.fortuneFull = [];

myGlobals.__fortune.fortuneMapNormal = new Map();
myGlobals.__fortune.fortuneMapVulgar = new Map();
myGlobals.__fortune.fortuneMapFull = new Map();

const categories = fs.readdirSync('./resource/fortune');
const categoriesVulgar = fs.readdirSync('./resource/fortune_vulgar');

for (const cat of categories)
	myGlobals.__fortune.categoriesFull.push(cat);

for (const cat of categoriesVulgar)
	myGlobals.__fortune.categoriesFull.push(cat);

for (const file of categories) {
	const data = fs.readFileSync('./resource/fortune/' + file, 'utf8');
	
	const mapData1 = [];
	const mapData2 = [];
	myGlobals.__fortune.fortuneMapNormal.set(file, mapData1);
	myGlobals.__fortune.fortuneMapFull.set(file, mapData2);
	
	const phrases = data.split('%');
	
	for (const phr of phrases) {
		myGlobals.__fortune.fortuneNormal.push(phr);
		mapData1.push(phr);
		myGlobals.__fortune.fortuneFull.push(phr);
		mapData2.push(phr);
	}
}

for (const file of categoriesVulgar) {
	const data = fs.readFileSync('./resource/fortune_vulgar/' + file, 'utf8');
	
	const mapData1 = [];
	let mapData2;
	myGlobals.__fortune.fortuneMapVulgar.set(file, mapData1);
	
	if (!myGlobals.__fortune.fortuneMapFull.has(file)) {
		mapData2 = [];
		myGlobals.__fortune.fortuneMapFull.set(file, mapData2);
	} else {
		mapData2 = myGlobals.__fortune.fortuneMapFull.get(file);
	}
	
	const phrases = data.split('%');
	
	for (const phr of phrases) {
		myGlobals.__fortune.fortuneVulgar.push(phr);
		mapData1.push(phr);
		myGlobals.__fortune.fortuneFull.push(phr);
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
			return '```' + Array.Random(myGlobals.__fortune.fortuneNormal) + '```';
		} else {
			args[0] = args[0].toLowerCase();
			
			if (!categories.includes(args[0]))
				return DBot.CommandError('Invalid fortune category', 'fortune', args, 1);
			
			return '```' + Array.Random(myGlobals.__fortune.fortuneMapNormal.get(args[0])) + '```';
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
			return '```' + Array.Random(myGlobals.__fortune.fortuneVulgar) + '```';
		} else {
			args[0] = args[0].toLowerCase();
			
			if (!categoriesVulgar.includes(args[0]))
				return DBot.CommandError('Invalid fortune category', 'fortune', args, 1);
			
			return '```' + Array.Random(myGlobals.__fortune.fortuneMapVulgar.get(args[0])) + '```';
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
			return '```' + Array.Random(myGlobals.__fortune.fortuneFull) + '```';
		} else {
			args[0] = args[0].toLowerCase();
			
			if (!myGlobals.__fortune.categoriesFull.includes(args[0]))
				return DBot.CommandError('Invalid fortune category', 'fortune', args, 1);
			
			return '```' + Array.Random(myGlobals.__fortune.fortuneMapFull.get(args[0])) + '```';
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
		return 'Avaliable categories are: ```\n' + myGlobals.__fortune.categoriesFull.join(', ') + '\n```';
	}
});
