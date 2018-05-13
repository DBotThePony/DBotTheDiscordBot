
//
// Copyright (C) 2017-2018 DBot.
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

import {CommandBase, CommandExecutionInstance, ImageCommandBase} from '../../CommandBase'
import {CommandHolder} from '../../CommandHolder'
import Discord = require('discord.js')

const charMap = [
	'q', 'w', 'e', 'r', 't', 'y', 'u',
	'i', 'o', 'p', 'a', 's', 'd', 'f',
	'g', 'h', 'j', 'k', 'l', 'z', 'x',
	'c', 'v', 'b', 'n', 'm', '1', '2',
	'3', '4', '5', '6', '7', '8', '9',
	'0', '[', ']', ';', '\'', '\\', ',',
	'.', '/', '?', '-', '=', '+', '!',
	'@', '#', '$', '%', '^', '&', '*',
	'(', ')', '~', '"', '{', '}', '<',
	'>', 'Q', 'W', 'E', 'R', 'T', 'Y',
	'U', 'U', 'I', 'O', 'P', 'A', 'S',
	'D', 'F', 'G', 'H', 'J', 'K', 'K',
	'L', 'Z', 'X', 'C', 'V', 'B', 'N',
	'M'
]

const charMapExp = [
	'q', 'w', 'e', 'r', 't', 'y', 'u',
	'i', 'o', 'p', 'a', 's', 'd', 'f',
	'g', 'h', 'j', 'k', 'l', 'z', 'x',
	'c', 'v', 'b', 'n', 'm', '1', '2',
	'3', '4', '5', '6', '7', '8', '9',
	'0', '\\[', '\\]', ';', '\'', '\\\\', ',',
	'\\.', '/', '\\?', '\\-', '=', '\\+', '!',
	'@', '\\#', '\\$', '%', '\\^', '\\&', '\\*',
	'\\(', '\\)', '~', '"', '\\{', '\\}', '\\﻿<',
	'﻿\\>', 'Q', 'W', 'E', 'R', 'T', 'Y',
	'U', 'U', 'I', 'O', 'P', 'A', 'S',
	'D', 'F', 'G', 'H', 'J', 'K', 'K',
	'L', 'Z', 'X', 'C', 'V', 'B', 'N',
	'M'
]

const charFullSpace = ['ｑ', 'ｗ', 'ｅ', 'ｒ', 'ｔ', 'ｙ', 'ｕ', 'ｉ', 'ｏ', 'ｐ', 'ａ', 'ｓ', 'ｄ', 'ｆ', 'ｇ', 'ｈ', 'ｊ', 'ｋ', 'ｌ', 'ｚ', 'ｘ', 'ｃ', 'ｖ', 'ｂ', 'ｎ', 'ｍ', '１', '２', '３', '４', '５', '６', '７', '８', '９', '０', '［', '］', '；', '＇', '＼', '，', '．', '／', '？', '－', '＝', '＋', '！', '＠', '＃', '＄', '％', '＾', '＆', '＊', '（', '）', '～', '｀', '﻿｛', '﻿｝', '﻿＜', '﻿＞', 'Ｑ', 'Ｗ', 'Ｅ', 'Ｒ', 'Ｔ', 'Ｙ', 'Ｕ', 'Ｕ', 'Ｉ', 'Ｏ', 'Ｐ', 'Ａ', 'Ｓ', 'Ｄ', 'Ｆ', 'Ｇ', 'Ｈ', 'Ｊ', 'Ｋ', 'Ｋ', 'Ｌ', 'Ｚ', 'Ｘ', 'Ｃ', 'Ｖ', 'Ｂ', 'Ｎ', 'Ｍ']

const flipMap = ['b', 'ʍ', 'ǝ', 'ɹ', 'ʇ', 'ʎ', 'n', 'ı', 'o', 'd', 'ɐ', 's', 'p', 'ɟ', 'ƃ', 'ɥ', 'ɾ', 'ʞ', 'ן', 'z', 'x', 'ɔ', 'ʌ', 'q', 'u', 'ɯ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', ';', ',', '\\', '‘', '.', '/', '¿', '-', '=', '+', '¡', '@', '#', '$', '%', '^', '⅋', '*', '(', ')', '~', '"', '{', '}', '<', '>', 'b', 'ʍ', 'ǝ', 'ɹ', 'ʇ', 'ʎ', 'n', 'n', 'ı', 'o', 'd', 'ɐ', 's', 'p', 'ɟ', 'ƃ', 'ɥ', 'ɾ', 'ʞ', 'ʞ', 'ן', 'z', 'x', 'ɔ', '𧐌', '', 'q', 'u', 'ɯ']
const flopMap = ['p', 'w', 'ɘ', 'ᴙ', 'T', 'Y', 'U', 'i', 'o', 'q', 'A', 'ꙅ', 'b', 'ꟻ', 'g', 'H', 'j', 'k', 'l', 'z', 'x', 'ↄ', 'v', 'd', 'ᴎ', 'm', '߁', '2', '3', '4', '5', '6', '7', '8', '9', '0', '[', ']', '⁏', '\'', '\\', ',', '.', '/', '⸮', '-', '=', '+', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '∽', '"', '{', '}', '<', '>', 'p', 'W', 'Ǝ', 'ᴙ', 'T', 'Y', 'U', 'U', 'I', 'O', 'ꟼ', 'A', 'Ꙅ', 'b', 'ꟻ', 'G', 'H', 'J', 'K', 'K', '⅃', 'Z', 'X', 'Ↄ', 'V', 'd', 'ᴎ', 'M']

interface StringMap {
	[key: string]: string
}

const mappedFull: StringMap = {}
const mappedFlip: StringMap = {}
const mappedFlop: StringMap = {}
const matchMap = '(' + charMapExp.join('|') + ')'
const matchMapExp = new RegExp(matchMap, 'gi')

for (let i in charMap) {
	mappedFull[charMap[i]] = charFullSpace[i]
	mappedFlip[charMap[i]] = flipMap[i]
	mappedFlop[charMap[i]] = flopMap[i]
}

class Aesthetics extends CommandBase {
	help = 'A e s t h e t i c s'

	constructor() {
		super('aesthetics', 'aes')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.get(1)) {
			instance.error('At least one word is required', 1)
			return
		}

		instance.reply(instance.raw.replace(matchMapExp, (m) => mappedFull[m] || m))
	}
}

class TextFlip extends CommandBase {
	help = 'Flips?'

	constructor() {
		super('tflip')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.get(1)) {
			instance.error('At least one word is required', 1)
			return
		}

		instance.reply(instance.raw.replace(matchMapExp, (m) => mappedFlip[m] || m))
	}
}

class TextFlop extends CommandBase {
	help = 'Flops?'

	constructor() {
		super('tflop')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.get(1)) {
			instance.error('At least one word is required', 1)
			return
		}

		instance.reply(instance.raw.replace(matchMapExp, (m) => mappedFlop[m] || m))
	}
}

export {Aesthetics, TextFlip, TextFlop}
