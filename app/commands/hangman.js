
// 
// Copyright (C) 2017 DBot
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

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
const json3 = require('json3');

const avaliableFortune = json3.parse(fs.readFileSync('./resource/hangman/hangman_fortune.json', 'utf8'));

const mapped = {
	generated_easy: avaliableFortune.easy,
	generated_medium: avaliableFortune.medium,
	generated_hard: avaliableFortune.hard,
	generated_very_hard: avaliableFortune.very_hard,
	generated_impossible: avaliableFortune.impossible,
	generated_wizard: avaliableFortune.wizard
};

let avaliableString = '';

for (const i in mapped) {
	avaliableString += ', ' + i;
}

avaliableString = avaliableString.substr(1);

const allowedChars = [
	'q',
	'w',
	'e',
	'r',
	't',
	'y',
	'u',
	'i',
	'i',
	'o',
	'p',
	'a',
	's',
	'd',
	'f',
	'g',
	'h',
	'j',
	'k',
	'l',
	'z',
	'x',
	'c',
	'v',
	'b',
	'n',
	'm',
	'Q',
	'W',
	'E',
	'R',
	'T',
	'Y',
	'U',
	'I',
	'O',
	'P',
	'A',
	'S',
	'D',
	'F',
	'G',
	'H',
	'J',
	'K',
	'L',
	'Z',
	'X',
	'C',
	'V',
	'B',
	'N',
	'M'
];

class HangmanDispatcher {
	constructor(channel, word) {
		this.channel = channel;
		
		if (this.channel.guild)
			this.server = this.channel.guild;
		else
			this.server = null;
		
		if (word)
			this.reset(word);
	}
	
	reset(word) {
		this.word = word.toLowerCase();
		
		const checkArray = word.split('');
		const newArray = [];
		
		for (const c of checkArray)
			if (!newArray.includes(c) && allowedChars.includes(c))
				newArray.push(c.toLowerCase());

		this.chars = newArray;
		
		this.WIN = 0;
		this.DEFEAT = 1;
		this.IN_GAME = 2;
		
		this.bannedChars = [];
		this.foundChars = [];
		this.defeat = 0;
		this.users = [];
	}

	checkChar(char) {
		return this.bannedChars.includes(char);
	}
	
	leftChars() {
		return Array.Diff(this.foundChars, this.chars)[1];
	}
	
	left() {
		return this.leftChars().length;
	}
	
	isUnlocked(char) {
		return this.foundChars.includes(char.toLowerCase());
	}

	tryChar(char, simulated) {
		if (this.checkChar(char))
			return false;
		
		char = char.toLowerCase();
		
		if (this.chars.includes(char)) {
			if (!simulated) {
				this.bannedChars.push(char);
				this.foundChars.push(char);
			}
			
			return true;
		} else {
			if (!simulated) {
				this.bannedChars.push(char);
				this.defeat++;
			}
			
			return false;
		}
	}
	
	suggest(user, char, simulated) {
		const status = this.tryChar(char, simulated);
		
		if (!simulated) {
			this.addPracticant(user);
			
			Postgres.query(`INSERT INTO hangman_score ("ID", "CHARS_SUGGESTED") VALUES (${sql.User(user)}, 1)
								ON CONFLICT ("ID") DO UPDATE SET "CHARS_SUGGESTED" = hangman_score."CHARS_SUGGESTED" + 1;`);
		}
		
		if (status) {
			if (!simulated) {
				Postgres.query(`INSERT INTO hangman_score ("ID", "CHARS_HIT") VALUES (${sql.User(user)}, 1)
									ON CONFLICT ("ID") DO UPDATE SET "CHARS_HIT" = hangman_score."CHARS_HIT" + 1;`);
			}
			
			return true;
		} else {
			if (!simulated) {
				Postgres.query(`INSERT INTO hangman_score ("ID", "CHARS_MISS") VALUES (${sql.User(user)}, 1)
									ON CONFLICT ("ID") DO UPDATE SET "CHARS_MISS" = hangman_score."CHARS_MISS" + 1;`);
			}
			
			return false;
		}
	}
	
	getStatus() {
		if (this.defeat >= 8)
			return this.DEFEAT;
		else if (this.left() > 0)
			return this.IN_GAME;
		else
			return this.WIN;
	}
	
	addPracticant(user) {
		if (this.users.includes(user))
			return;
		
		this.users.push(user);
		
		Postgres.query(`INSERT INTO hangman_score ("ID", "GAMES", "TOTAL_LENGTH") VALUES (${sql.User(user)}, 1, ${this.word.length})
							ON CONFLICT ("ID") DO UPDATE SET "GAMES" = hangman_score."GAMES" + 1,
															 "TOTAL_LENGTH" = hangman_score."TOTAL_LENGTH" + excluded."TOTAL_LENGTH";`);
	}
	
	
	practicantsNames() {
		const output = [];
		
		for (const user of this.users) {
			output.push('<@' + user.id + '>');
		}
		
		return output.join(', ');
	}
	
	saveStats() {
		const st = this.getStatus();
		
		if (st === this.IN_GAME)
			return;
		
		if (st === this.WIN) {
			for (const user of this.users) {
				Postgres.query(`INSERT INTO hangman_score ("ID", "VICTORIES", "LENGTH_WIN") VALUES (${sql.User(user)}, 1, ${this.word.length})
								ON CONFLICT ("ID") DO UPDATE SET "VICTORIES" = hangman_score."VICTORIES" + 1,
																 "LENGTH_WIN" = hangman_score."LENGTH_WIN" + excluded."LENGTH_WIN";`);
			}
		} else if (st === this.DEFEAT) {
			for (const user of this.users) {
				Postgres.query(`INSERT INTO hangman_score ("ID", "DEFEATS", "LENGTH_DEF") VALUES (${sql.User(user)}, 1, ${this.word.length})
								ON CONFLICT ("ID") DO UPDATE SET "DEFEATS" = hangman_score."DEFEATS" + 1,
																 "LENGTH_DEF" = hangman_score."LENGTH_DEF" + excluded."LENGTH_DEF";`);
			}
		}
	}
	
	abort() {
		if (this.bannedChars.length === 0 || this.getStatus() === this.WIN || this.getStatus() === this.DEFEAT)
			return false; // Game doesn't even started or finished
		
		for (const user of this.users) {
			Postgres.query(`INSERT INTO hangman_score ("ID", "ABORTS", "LENGTH_ABORT") VALUES (${sql.User(user)}, 1, ${this.word.length})
							ON CONFLICT ("ID") DO UPDATE SET "ABORTS" = hangman_score."ABORTS" + 1,
															 "LENGTH_ABORT" = hangman_score."LENGTH_ABORT" + excluded."LENGTH_ABORT";`);
		}
		
		return true;
	}
	
	buildWord() {
		let output = '';
		
		for (const char of this.word) {
			if (!allowedChars.includes(char))
				output += '   ';
			else if (this.isUnlocked(char))
				output += ' ' + char;
			else
				output += ' _';
		}
		
		return output;
	}
	
	getStatusString() {
		let output = '```';
		
		output += `Word - ${this.buildWord()}\n`;
		output += `Named chars: ${this.bannedChars.join(', ')}\n`;
		output += `Left: ${this.foundChars.length}/${this.chars.length} (${this.chars.length - this.foundChars.length}) chars\n`;
		output += `Lives: ${8 - this.defeat}/8\n`;
		
		return output + '```';
	}
}

myGlobals.HangmanStatus = myGlobals.HangmanStatus || {};
const status = myGlobals.HangmanStatus;

module.exports = {
	name: 'hangman',

	help_args: '<action> [arguments]',
	desc: 'Hangman mini-game',
	delay: 0,

	func: function(args, cmd, msg) {
		const action = (args[0] || '').toLowerCase();
		const channelID = msg.channel.id;
		
		if (action === 'start' || action === 'create' || action === 'begin') {
			if (status[channelID])
				return DBot.CommandError('Game already started! try `reset` command', 'hangman', args, 1);
			
			const pick = args[1] || 'generated_medium';
			
			if (!mapped[pick])
				return DBot.CommandError('Invalid difficulty pick\nValids are: ```' + avaliableString + '```', 'hangman', args, 2);
			
			status[channelID] = new HangmanDispatcher(this.channel, Array.Random(mapped[pick]));
			status[channelID].map = mapped[pick];
			status[channelID].pick = pick;
			
			return 'The game has started with `' + pick + '` difficulty!\n' + status[channelID].getStatusString();
		} else if (action === 'suggest' || action === 's' || action === 'try') {
			if (!status[channelID])
				return DBot.CommandError('There is no game at all!', 'hangman', args, 1);
			
			const cStatus = status[channelID].getStatus();
			
			if (cStatus === status[channelID].WIN || cStatus === status[channelID].DEFEAT)
				return 'Game already finished! try `reset` command\n' + status[channelID].getStatusString();
			
			const char = args[1];
			if (!char || !allowedChars.includes(char))
				return DBot.CommandError('Invalid char', 'hangman', args, 2);
			
			if (status[channelID].checkChar(char))
				return 'Char was already suggested!\n' + status[channelID].getStatusString();
			
			const st = status[channelID].suggest(this.author, char);
			const status2 = status[channelID].getStatus();
			
			if (st)
				if (status2 === status[channelID].WIN) {
					status[channelID].saveStats();
					return 'That was correct!\nCongrants! ' + status[channelID].practicantsNames() + ' won!\n' + status[channelID].getStatusString();
				} else {
					return 'That was correct!\n' + status[channelID].getStatusString();
				}
			else
				if (status2 === status[channelID].DEFEAT) {
					status[channelID].saveStats();
					return 'That was miss!\n' + status[channelID].practicantsNames() + ' lose!\n' + status[channelID].getStatusString();
				} else {
					return 'That was miss!\n' + status[channelID].getStatusString();
				}
		} else if (action === 'reset' || action === 'new' || action === 'newgame' || action === 'restart') {
			if (!status[channelID])
				return DBot.CommandError('There is no game at all!', 'hangman', args, 1);
			
			const st = status[channelID].abort();
			status[channelID].reset(Array.Random(status[channelID].map));
			
			if (st)
				return 'Game was aborted and has been counted as aborted game.\nGame has been reset on `' + status[channelID].pick + '` difficulty!\n' + status[channelID].getStatusString();
			else
				return 'Game has been reset on `' + status[channelID].pick + '` difficulty!\n' + status[channelID].getStatusString();
		} else if (action === 'stop' || action === 'remove' || action === 'delete' || action === 'close') {
			if (!status[channelID])
				return DBot.CommandError('There is no game at all!', 'hangman', args, 1);
			
			const st = status[channelID].abort();
			delete status[channelID];
			
			if (st)
				return 'Game was aborted and has been counted as aborted game.\nGame instance has been deleted.';
			else
				return 'Game instance has been deleted.';
		} else {
			return DBot.CommandError('Unknown action', 'hangman', args, 1);
		}
	}
};

