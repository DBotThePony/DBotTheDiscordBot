
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

	const phrasesAllMap = {};
	phrasesAllMap.easy = {};
	phrasesAllMap.medium = {};
	phrasesAllMap.hard = {};
	phrasesAllMap.very_hard = {};

	const phrasesCategory = {};
	const phrasesCategoryMap = {};

	for (const file of categories) {
		const data = fs.readFileSync(path + '/' + file, 'utf8');
		const phrases = data.split('%');
		phrasesCategory[file] = {};
		const pData = phrasesCategory[file];
		pData.easy = [];
		pData.medium = [];
		pData.hard = [];
		pData.very_hard = [];

		phrasesCategoryMap[file] = {};
		const pDataMap = phrasesCategoryMap[file];
		pDataMap.easy = {};
		pDataMap.medium = {};
		pDataMap.hard = {};
		pDataMap.very_hard = {};

		for (const phrase of phrases) {
			const div = phrase.replace(/\r?\n/gi, '').split(/(,|\.|\})/);

			for (const solid of div) {
				let spacesSplit = solid.split(' ');
				
				for (const i in spacesSplit) {
					let str = spacesSplit[i].replace(toReplaceSoft, '').replace(toReplace, '').replace(toReplaceHard, ' ').trim();
					if (str[str.length - 1] === '}') // wtf
						str = str.substr(0, str.length - 1);
					
					spacesSplit[i] = str;
				}
				
				spacesSplit = spacesSplit.filter(wordFilter);
				
				for (let i = 0; i < spacesSplit.length; i++) {
					if (!phrasesAllMap.easy[spacesSplit[i]]) {
						phrasesAll.easy.push(spacesSplit[i]);
						phrasesAllMap.easy[spacesSplit[i]] = true;
					}

					if (!pDataMap.easy[spacesSplit[i]]) {
						pData.easy.push(spacesSplit[i]);
						pDataMap.easy[spacesSplit[i]] = true;
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

					if (!pDataMap.medium[phr]) {
						pData.medium.push(phr);
						pDataMap.medium[phr] = true;
					}
				}

				for (let i = 0; i < spacesSplit.length; i += 4) {
					if (!spacesSplit[i + 1] || !spacesSplit[i + 2] || !spacesSplit[i + 3])
						break;

					const phr = `${spacesSplit[i]} ${spacesSplit[i + 1]} ${spacesSplit[i + 2]} ${spacesSplit[i + 3]}}`;

					if (!phrasesAllMap.hard[phr]) {
						phrasesAll.hard.push(phr);
						phrasesAllMap.hard[phr] = true;
					}

					if (!pDataMap.hard[phr]) {
						pData.hard.push(phr);
						pDataMap.hard[phr] = true;
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

					if (!pDataMap.very_hard[phr]) {
						pData.very_hard.push(phr);
						pDataMap.very_hard[phr] = true;
					}
				}
			}
		}
	}
	
	return [phrasesAll, phrasesCategory];
}

const [fortuneDefault, fortuneDefaultCat] = genTables('../resource/fortune');

fs.writeFileSync('../resource/hangman/hangman_fortune.json', json3.stringify({
	all: fortuneDefault,
	category: fortuneDefaultCat
}, null, 1));

const [fortuneVulgar, fortuneVulgarCat] = genTables('../resource/fortune_vulgar');

fs.writeFileSync('../resource/hangman/hangman_fortunev.json', json3.stringify({
	all: fortuneVulgar,
	category: fortuneVulgarCat
}, null, 1));
