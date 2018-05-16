
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

import {CommandBase, CommandExecutionInstance, ImageCommandBase} from '../CommandBase'
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')
import fs = require('fs')

const allowedCharacters = [
	'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'
]

interface IWordSet {
	[key: string]: string[]
}

const wordSets: IWordSet = {
	hard: fs.readFileSync('./resource/hangman/hard.csv', 'utf8').split(/\r?\n/),
	medium: fs.readFileSync('./resource/hangman/medium.csv', 'utf8').split(/\r?\n/),
	easy: fs.readFileSync('./resource/hangman/easy.csv', 'utf8').split(/\r?\n/),
	very_easy: fs.readFileSync('./resource/hangman/very_easy.csv', 'utf8').split(/\r?\n/),
	generated_simple: fs.readFileSync('./resource/hangman/gen_simple.csv', 'utf8').split(/\r?\n/)
}

for (const fName of ['hard', 'medium', 'easy', 'very_easy']) {
	wordSets['word_gen_' + fName + '_two'] = fs.readFileSync('./resource/hangman/gen_' + fName + '_two.csv', 'utf8').split(/\r?\n/);
	wordSets['word_gen_' + fName + '_three'] = fs.readFileSync('./resource/hangman/gen_' + fName + '_three.csv', 'utf8').split(/\r?\n/);
	wordSets['word_gen_' + fName + '_four'] = fs.readFileSync('./resource/hangman/gen_' + fName + '_four.csv', 'utf8').split(/\r?\n/);
}

const setList: string[] = []

for (const index in wordSets) {
	setList.push(index)
	const value = wordSets[index]

	const newValue = value.filter((valueIn) => {
		return valueIn.trim() == valueIn &&
			valueIn.match(/[a-z ]/i) != null
	})

	wordSets[index] = newValue
}

class GameStatus {
	chars: string[]
	named: (string | null)[] = []
	guessed: string[] = []
	finished = false
	lives: number

	constructor(public channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel, public word: string, public wordset: string[]) {
		this.chars = word.split('')

		for (let i = 0; i < word.length; i++) {
			this.named.push(null)
		}

		this.lives = Math.max(word.length, 6)
	}

	constructWord() {
		let word = ''

		for (const char of this.named) {
			if (char) {
				word += ' ' + char
			} else {
				word += ' _'
			}
		}

		return word.substr(1)
	}

	isFinished() {
		return this.finished
	}

	canPlay() {
		return !this.finished && this.lives > 0
	}

	victory() {
		for (const char of this.named) {
			if (char == null) {
				return false
			}
		}

		return true
	}

	status() {
		if (this.lives > 0) {
			if (this.victory()) {
				return 'Win!\nLives left: ' + this.lives + '\nNamed: ' + this.guessed.join(', ') + '\nWord: ' + this.chars.join(' ')
			} else {
				return 'Lives: ' + this.lives + '\nNamed: ' + this.guessed.join(', ') + '\nWord: ' + this.constructWord()
			}
		} else {
			return 'Game over!' + '\nWere named: ' + this.guessed.join(', ') + '\nWord: ' + this.chars.join(' ') + '\nGuess: ' + this.constructWord()
		}
	}

	play(instance: CommandExecutionInstance, character: string) {
		if (!this.canPlay()) {
			instance.reply('Game instance is either finished or invalid!')
			return
		}

		character = character.toLowerCase()

		if (this.guessed.includes(character)) {
			instance.reply('This character were previously named!\n```\n' + this.status() + '\n```')
			return
		}

		this.guessed.push(character)

		if (!this.chars.includes(character)) {
			this.lives--

			if (this.lives > 0) {
				instance.reply('That was miss! One live is lost!\n```\n' + this.status() + '\n```')
			} else {
				this.finished = true
				instance.reply('That was miss and you lose!\n```\n' + this.status() + '\n```')
			}

			return
		}

		for (let i = 0; i < this.chars.length; i++) {
			if (this.chars[i] == character) {
				this.named[i] = character
			}
		}

		if (this.victory()) {
			this.finished = true
			instance.reply('Hit! and you won!\n```\n' + this.status() + '\n```')
		} else {
			instance.reply('Hit!\n```\n' + this.status() + '\n```')
		}
	}
}

class GuessAWordGame extends CommandBase {
	help = 'Play a hangman like game! Actions are new, status, end, guess'
	args = '<action> [argument]'

	gameStatus = new Map<string, GameStatus>()

	constructor() {
		super('hangman', 'wordgame', 'guessaword', 'drownman')
	}

	start(instance: CommandExecutionInstance) {
		if (this.gameStatus.has(instance.channel!.id) && (<GameStatus> this.gameStatus.get(instance.channel!.id)).canPlay()) {
			instance.reply('Already in game!')
			return
		}

		const wordSetToUse = (<string> instance.get(2) || 'easy').toLowerCase()

		if (!wordSets[wordSetToUse]) {
			instance.error('Invalid word set provided! Valid are ' + setList.join(', '), 2)
			return
		}

		const word = wordSets[wordSetToUse][Math.floor(Math.random() * (wordSets[wordSetToUse].length - 1))]
		const game = new GameStatus(instance.channel!, word, wordSets[wordSetToUse])

		this.gameStatus.set(instance.channel!.id, game)

		instance.send('Game has started on `' + wordSetToUse + '` word set!\n```\n' + game.status() + '\n```')
	}

	restart(instance: CommandExecutionInstance) {
		if (!this.gameStatus.has(instance.channel!.id)) {
			instance.reply('No game in progress!')
			return
		}

		const game = new GameStatus(instance.channel!, (<GameStatus> this.gameStatus.get(instance.channel!.id)).word, (<GameStatus> this.gameStatus.get(instance.channel!.id)).wordset)
		this.gameStatus.set(instance.channel!.id, game)

		instance.send('Game has restarted with same word set!\n```\n' + game.status() + '\n```')
	}

	stop(instance: CommandExecutionInstance) {
		if (!this.gameStatus.has(instance.channel!.id)) {
			instance.reply('No game in progress!')
			return
		}

		const game = <GameStatus> this.gameStatus.get(instance.channel!.id)
		game.lives = 0
		instance.send('Game is over!\n```\n' + game.status() + '\n```')
		this.gameStatus.delete(instance.channel!.id)
	}

	status(instance: CommandExecutionInstance) {
		if (!this.gameStatus.has(instance.channel!.id)) {
			instance.reply('No game in progress!')
			return
		}

		const game = <GameStatus> this.gameStatus.get(instance.channel!.id)
		instance.send('```\n' + game.status() + '\n```')
	}

	guess(instance: CommandExecutionInstance) {
		if (!this.gameStatus.has(instance.channel!.id)) {
			instance.reply('No game in progress!')
			return
		}

		if (!instance.assert(2, 'Mising character to name')) {
			return
		}

		const char = <string> instance.get(2)

		if (!allowedCharacters.includes(char)) {
			instance.reply('Invalid character to name!')
			return
		}

		const game = <GameStatus> this.gameStatus.get(instance.channel!.id)
		game.play(instance, char)
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.channel) {
			return true
		}

		if (!instance.assert(1, 'Invalid action specified. Valid are new/start, restart, status, end/stop, guess')) {
			return
		}

		switch ((<string> instance.get(1)).toLowerCase()) {
			case 'start':
			case 'new':
				this.start(instance)
				return
			case 'restart':
				this.restart(instance)
				return
			case 'stop':
			case 'end':
				this.stop(instance)
				return
			case 'status':
				this.status(instance)
				return
			case 'guess':
				this.guess(instance)
				return
			default:
				instance.error('Invalid action specified. Valid are new, status, end, guess', 1)
		}
	}
}

class GuessCommand extends CommandBase {
	help = 'Alias for }hangman guess'
	args = '<character>'

	constructor() {
		super('guess', 'namechar', 'guesschar', 'guesscharacter')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.channel) {
			return true
		}

		if (!instance.bot.commands.get('hangman')) {
			throw new Error('Invalid command list state (hangman command is absent)')
		}

		if (!instance.assert(1, 'No character specified')) {
			return
		}

		const command = <GuessAWordGame> instance.bot.commands.get('hangman')

		if (!command.gameStatus.has(instance.channel!.id)) {
			instance.reply('No game in progress!')
			return
		}

		const char = <string> instance.get(1)

		if (!allowedCharacters.includes(char)) {
			instance.reply('Invalid character to name!')
			return
		}

		const game = <GameStatus> command.gameStatus.get(instance.channel!.id)
		game.play(instance, char)
	}
}

export {GuessAWordGame, GuessCommand}
