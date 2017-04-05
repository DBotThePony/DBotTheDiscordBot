
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

const fs = require('fs');
const json3 = require('json3');

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

const matchValid = new RegExp(`((${allowedChars.join('|')})+)$`);
const toReplace = new RegExp(`[^${allowedChars.join('')} "?!:\t]`, 'g');
const toReplaceSoft = new RegExp(`["?!]`, 'g');
const toReplaceHard = new RegExp(`(\t|:|\\]|\\})`, 'g');

const wordFilter = function(word) {
	if (word.length < 6)
		return false;
	
	if (!word.match(matchValid))
		return false;
	
	return true;
};

function genTables(path) {
	const categories = fs.readdirSync(path);
	
	const phrasesAll = {};
	phrasesAll.easy = [];
	phrasesAll.medium = [];
	phrasesAll.hard = [];
	phrasesAll.very_hard = [];
	phrasesAll.impossible = [];
	phrasesAll.wizard = [];

	const phrasesAllMap = {};
	phrasesAllMap.easy = {};
	phrasesAllMap.medium = {};
	phrasesAllMap.hard = {};
	phrasesAllMap.very_hard = {};
	phrasesAllMap.impossible = {};
	phrasesAllMap.wizard = {};

	for (const file of categories) {
		const data = fs.readFileSync(path + '/' + file, 'utf8');
		const phrases = data.split('%');

		for (const phrase of phrases) {
			const div = phrase.replace(/\r?\n/gi, '').split(/(,|\.)/);
			const divImpossible = phrase.replace(/\r?\n/gi, '').split(/(\.)/);

			for (const solid of div) {
				let spacesSplit = solid.split(' ');
				
				for (const i in spacesSplit) {
					spacesSplit[i] = spacesSplit[i].replace(toReplaceSoft, '').replace(toReplace, '').replace(toReplaceHard, ' ').trim();
				}
				
				spacesSplit = spacesSplit.filter(wordFilter);
				
				for (let i = 0; i < spacesSplit.length; i++) {
					if (!phrasesAllMap.easy[spacesSplit[i]]) {
						phrasesAll.easy.push(spacesSplit[i]);
						phrasesAllMap.easy[spacesSplit[i]] = true;
					}
				}

				for (let i = 0; i < spacesSplit.length; i += 3) {
					if (!spacesSplit[i + 1] || !spacesSplit[i + 2])
						break;

					const phr = `${spacesSplit[i]} ${spacesSplit[i + 1]} ${spacesSplit[i + 2]}`;

					if (!phrasesAllMap.medium[phr]) {
						phrasesAll.medium.push(phr);
						phrasesAllMap.medium[phr] = true;
					}
				}

				for (let i = 0; i < spacesSplit.length; i += 4) {
					if (!spacesSplit[i + 1] || !spacesSplit[i + 2] || !spacesSplit[i + 3])
						break;

					const phr = `${spacesSplit[i]} ${spacesSplit[i + 1]} ${spacesSplit[i + 2]} ${spacesSplit[i + 3]}`;

					if (!phrasesAllMap.hard[phr]) {
						phrasesAll.hard.push(phr);
						phrasesAllMap.hard[phr] = true;
					}
				}

				for (let i = 0; i < spacesSplit.length; i += 5) {
					if (!spacesSplit[i + 1] || !spacesSplit[i + 2] || !spacesSplit[i + 3] || !spacesSplit[i + 4])
						break;

					const phr = `${spacesSplit[i]} ${spacesSplit[i + 1]} ${spacesSplit[i + 2]} ${spacesSplit[i + 3]} ${spacesSplit[i + 4]}`;

					if (!phrasesAllMap.very_hard[phr]) {
						phrasesAll.very_hard.push(phr);
						phrasesAllMap.very_hard[phr] = true;
					}
				}
			}

			for (const solid of divImpossible) {
				let spacesSplit = solid.split(' ');
				
				for (const i in spacesSplit) {
					spacesSplit[i] = spacesSplit[i].replace(toReplaceSoft, '').replace(toReplace, '').replace(toReplaceHard, ' ').trim();
				}
				
				spacesSplit = spacesSplit.filter(wordFilter);
				
				for (let i = 0; i < spacesSplit.length; i += 6) {
					if (!spacesSplit[i + 1] || !spacesSplit[i + 2] || !spacesSplit[i + 3] || !spacesSplit[i + 4] || !spacesSplit[i + 5])
						break;

					const phr = `${spacesSplit[i]} ${spacesSplit[i + 1]} ${spacesSplit[i + 2]} ${spacesSplit[i + 3]} ${spacesSplit[i + 4]} ${spacesSplit[i + 5]}`;

					if (!phrasesAllMap.impossible[phr]) {
						phrasesAll.impossible.push(phr);
						phrasesAllMap.impossible[phr] = true;
					}
				}
				
				for (let i = 0; i < spacesSplit.length; i += 7) {
					if (!spacesSplit[i + 1] || !spacesSplit[i + 2] || !spacesSplit[i + 3] || !spacesSplit[i + 4] || !spacesSplit[i + 5] || !spacesSplit[i + 6])
						break;

					const phr = `${spacesSplit[i]} ${spacesSplit[i + 1]} ${spacesSplit[i + 2]} ${spacesSplit[i + 3]} ${spacesSplit[i + 4]} ${spacesSplit[i + 5]} ${spacesSplit[i + 6]}`;

					if (!phrasesAllMap.wizard[phr]) {
						phrasesAll.wizard.push(phr);
						phrasesAllMap.wizard[phr] = true;
					}
				}
			}
		}
	}
	
	return phrasesAll;
}

const fortuneDefault = genTables('../resource/fortune');

fs.writeFileSync('../resource/hangman/hangman_fortune.json', json3.stringify(fortuneDefault, null, 1));

const fortuneVulgar = genTables('../resource/fortune_vulgar');

fs.writeFileSync('../resource/hangman/hangman_fortunev.json', json3.stringify(fortuneVulgar, null, 1));
