
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

{
	function genTables(path) {
		const categories = fs.readdirSync(path);

		const phrasesAll = {};
		phrasesAll.very_easy = [];
		phrasesAll.easy = [];
		phrasesAll.medium = [];
		phrasesAll.hard = [];
		phrasesAll.wizard = [];

		const phrasesAllMap = {};
		phrasesAllMap.very_easy = {};
		phrasesAllMap.easy = {};
		phrasesAllMap.medium = {};
		phrasesAllMap.hard = {};
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
						if (!phrasesAllMap.wizard[spacesSplit[i]]) {
							phrasesAll.wizard.push(spacesSplit[i]);
							phrasesAllMap.wizard[spacesSplit[i]] = true;
						}
					}

					for (let i = 0; i < spacesSplit.length; i += 2) {
						if (!spacesSplit[i + 1])
							break;

						const phr = `${spacesSplit[i]} ${spacesSplit[i + 1]}`;

						if (!phrasesAllMap.hard[phr]) {
							phrasesAll.hard.push(phr);
							phrasesAllMap.hard[phr] = true;
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

						if (!phrasesAllMap.easy[phr]) {
							phrasesAll.easy.push(phr);
							phrasesAllMap.easy[phr] = true;
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

						if (!phrasesAllMap.very_easy[phr]) {
							phrasesAll.very_easy.push(phr);
							phrasesAllMap.very_easy[phr] = true;
						}
					}

					for (let i = 0; i < spacesSplit.length; i += 7) {
						if (!spacesSplit[i + 1] || !spacesSplit[i + 2] || !spacesSplit[i + 3] || !spacesSplit[i + 4] || !spacesSplit[i + 5] || !spacesSplit[i + 6])
							break;

						const phr = `${spacesSplit[i]} ${spacesSplit[i + 1]} ${spacesSplit[i + 2]} ${spacesSplit[i + 3]} ${spacesSplit[i + 4]} ${spacesSplit[i + 5]} ${spacesSplit[i + 6]}`;

						if (!phrasesAllMap.very_easy[phr]) {
							phrasesAll.very_easy.push(phr);
							phrasesAllMap.very_easy[phr] = true;
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
}

Array.Random = function(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
};

{
	function genWords(array) {
		const buildTwo = [];
		const buildThree = [];
		const buildFour = [];

		for (let i = 0; i < array.length * 2; i++) {
			buildTwo.push(`${Array.Random(array)} ${Array.Random(array)}`);
		}

		for (let i = 0; i < array.length * 4; i++) {
			buildThree.push(`${Array.Random(array)} ${Array.Random(array)} ${Array.Random(array)}`);
		}

		for (let i = 0; i < array.length * 8; i++) {
			buildFour.push(`${Array.Random(array)} ${Array.Random(array)} ${Array.Random(array)} ${Array.Random(array)}`);
		}

		return [buildTwo, buildThree, buildFour];
	}

	for (const fName of ['hard', 'medium', 'easy', 'very_easy']) {
		const [two, three, four] = genWords(fs.readFileSync('../resource/hangman/' + fName + '.csv', 'utf8').split(/\r?\n/));

		fs.writeFileSync('../resource/hangman/gen_' + fName + '_two.csv', two.join('\n'));
		fs.writeFileSync('../resource/hangman/gen_' + fName + '_three.csv', three.join('\n'));
		fs.writeFileSync('../resource/hangman/gen_' + fName + '_four.csv', four.join('\n'));
	}
}

{
	const testWords = ['buzz', 'guzz', 'muzz', 'nuzz', 'puzz', 'tuzz', 'wuzz', 'zigzagg'];
	const possibleEndings = ['le', 'ing', 'iest', 'er', 'ers', 'iness', 'ed'];
	
	const build = [];
	
	for (const word of testWords) {
		for (const end of possibleEndings) {
			build.push(word + end);
		}
	}
	
	fs.writeFileSync('../resource/hangman/gen_simple.csv', build.join('\n'));
}
