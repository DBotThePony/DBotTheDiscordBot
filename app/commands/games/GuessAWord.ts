
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
			valueIn.match(/^[a-z ]+$/i) != null
	})

	for (const i in newValue) {
		newValue[i] = newValue[i].toLowerCase().trim()
	}

	wordSets[index] = newValue
}

class GameStatus {
	chars: string[]
	named: (string | null)[] = []
	guessed: string[] = []
	finished = false
	fullguess = false
	lives: number

	constructor(public channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel, public word: string, public wordset: string[], public parent: CommandBase) {
		this.chars = word.split('')

		for (let i = 0; i < word.length; i++) {
			if (word[i] == ' ') {
				this.named.push(' ')
			} else {
				this.named.push(null)
			}
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
				return 'Win!' + (this.fullguess && '\nWORD WAS FULLY GUESSED!' || '') + '\nLives left: ' + this.lives + '\nNamed: ' + this.guessed.join(', ') + '\nWord: ' + this.chars.join(' ')
			} else {
				return 'Lives: ' + this.lives + '\nNamed: ' + this.guessed.join(', ') + '\nWord: ' + this.constructWord()
			}
		} else {
			return 'Game over!' + (this.fullguess && '\nU Tried :star:' || '') +  '\nWere named: ' + this.guessed.join(', ') + '\nWord: ' + this.chars.join(' ') + '\nGuess: ' + this.constructWord()
		}
	}

	users: Discord.User[] = []
	queries: string[] = []

	finish() {
		this.finished = true

		if (this.victory()) {
			for (const user of this.users) {
				this.increment(user, 'victories')
			}
		} else {
			for (const user of this.users) {
				this.increment(user, 'defeats')
			}
		}

		if (this.queries.length != 0) {
			this.parent.bot.sql.query(`BEGIN; ${this.queries.join(';')}; COMMIT;`).catch(console.error)
		}
	}

	register(user: Discord.User) {
		this.queries.push(`INSERT INTO "hangman_stats" ("user") VALUES (${user.id}) ON CONFLICT DO NOTHING`)
	}

	increment(user: Discord.User, field: string, by = 1) {
		this.queries.push(`UPDATE "hangman_stats" SET "${field}" = "${field}" + ${by} WHERE "user" = ${user.id}`)
	}

	play(instance: CommandExecutionInstance, character: string) {
		if (!this.canPlay()) {
			instance.reply('Game instance is either finished or invalid!')
			return
		}

		character = character.toLowerCase()

		if (!this.users.includes(instance.user!)) {
			this.users.push(instance.user!)

			this.register(instance.user!)
			this.queries.push(`UPDATE "hangman_stats" SET "games" = "games" + 1, "length" = "length" + ${this.word.length} WHERE "user" = ${instance.user!.id}`)
		}

		this.increment(instance.user!, 'guesses')
		this.increment(instance.user!, 'length_guess', character.length)

		if (character.length == 1) {
			if (this.guessed.includes(character)) {
				instance.reply('This character were previously named!\n```\n' + this.status() + '\n```')
				return
			}

			this.guessed.push(character)

			if (!this.chars.includes(character)) {
				this.lives--

				this.increment(instance.user!, 'guesses_miss')

				if (this.lives > 0) {
					instance.reply('That was miss! One live is lost!\n```\n' + this.status() + '\n```')
				} else {
					this.finish()
					instance.reply('That was miss and you lose! BETTER LUCK NEXT TIME!\n```\n' + this.status() + '\n```')
				}

				return
			}

			for (let i = 0; i < this.chars.length; i++) {
				if (this.chars[i] == character) {
					this.named[i] = character
				}
			}

			this.increment(instance.user!, 'guesses_hits')

			if (this.victory()) {
				this.finish()
				instance.reply('Hit! and you won!\n```\n' + this.status() + '\n```')
			} else {
				instance.reply('Hit!\n```\n' + this.status() + '\n```')
			}
		} else {
			this.increment(instance.user!, 'full_guesses')

			this.fullguess = true

			if (character == this.word) {
				this.increment(instance.user!, 'full_guesses_hits')

				for (let i = 0; i < this.chars.length; i++) {
					this.named[i] = this.chars[i]
				}

				this.lives = 9000
				instance.reply('OMEGAWIN!\n```\n' + this.status() + '\n```')
			} else {
				this.increment(instance.user!, 'full_guesses_miss')
				this.lives = 0
				instance.reply('OMEGALOOSE!\n```\n' + this.status() + '\n```')
			}

			this.finish()
		}
	}
}

class GuessAWordGame extends CommandBase {
	help = 'Play a hangman like game! Actions are new, status, end, guess'
	args = '<action> [argument]'
	guessExp = /[a-z ]/i

	gameStatus = new Map<string, GameStatus>()
	wordSets = wordSets
	setList = setList

	constructor(prefix = '') {
		super(prefix + 'hangman', prefix + 'wordgame', prefix + 'guessaword', prefix + 'drownman')
	}

	start(instance: CommandExecutionInstance) {
		if (this.gameStatus.has(instance.channel!.id) && (<GameStatus> this.gameStatus.get(instance.channel!.id)).canPlay()) {
			instance.reply('Already in game!')
			return
		}

		const wordSetToUse = (<string> instance.get(2) || 'easy').toLowerCase()

		if (!this.wordSets[wordSetToUse]) {
			instance.error('Invalid word set provided! Valid are ' + this.setList.join(', '), 2)
			return
		}

		const word = this.wordSets[wordSetToUse][Math.floor(Math.random() * (this.wordSets[wordSetToUse].length - 1))]
		const game = new GameStatus(instance.channel!, word, this.wordSets[wordSetToUse], this)

		game.register(instance.user!)
		game.increment(instance.user!, 'started')
		this.gameStatus.set(instance.channel!.id, game)

		instance.send('Game has started on `' + wordSetToUse + '` word set!\n```\n' + game.status() + '\n```')
	}

	restart(instance: CommandExecutionInstance) {
		if (!this.gameStatus.has(instance.channel!.id)) {
			instance.reply('No game in progress!')
			return
		}

		const wordset = (<GameStatus> this.gameStatus.get(instance.channel!.id)).wordset
		const word = wordset[Math.floor(Math.random() * (wordset.length - 1))]
		const game = new GameStatus(instance.channel!, word, wordset, this)
		game.register(instance.user!)
		game.increment(instance.user!, 'started')
		this.gameStatus.set(instance.channel!.id, game)

		instance.send('Game has restarted with same word set!\n```\n' + game.status() + '\n```')
	}

	stop(instance: CommandExecutionInstance) {
		if (!this.gameStatus.has(instance.channel!.id)) {
			instance.reply('No game in progress!')
			return
		}

		const game = <GameStatus> this.gameStatus.get(instance.channel!.id)
		game.register(instance.user!)
		game.increment(instance.user!, 'stopped')
		game.lives = 0
		instance.send('Game is over!\n```\n' + game.status() + '\n```')
		game.finish()
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

		const char = (<string[]> instance.from(2)).join(' ')

		if (!char.match(this.guessExp)) {
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
	guessExp = /[a-z ]/i
	commandID = 'hangman'

	constructor(prefix = '') {
		super(prefix + 'guess', prefix + 'namechar', prefix + 'guesschar', prefix + 'guesscharacter')
	}

	executed(instance: CommandExecutionInstance) {
		if (!instance.channel) {
			return true
		}

		if (!instance.bot.commands.get(this.commandID)) {
			throw new Error('Invalid command list state (hangman command is absent)')
		}

		if (!instance.assert(1, 'No character specified')) {
			return
		}

		const command = <GuessAWordGame> instance.bot.commands.get(this.commandID)

		if (!command.gameStatus.has(instance.channel!.id)) {
			instance.reply('No game in progress!')
			return
		}

		const char = instance.raw

		if (!char.match(this.guessExp)) {
			instance.reply('Invalid character to name!')
			return
		}

		const game = <GameStatus> command.gameStatus.get(instance.channel!.id)
		game.play(instance, char)
	}
}

const russianWordSets: IWordSet = {
	easy: [],
	medium: [],
	hard: [],
	very_hard: [],
}

{
	const readRussian = fs.readFileSync('./resource/hangman/5000lemma.num', 'utf8').split(/\r?\n/)

	const matchWord = /^[0-9]+ [0-9.]+ ([а-яА-Я]+) ([a-z]+)$/i
	let i = 0
	let group = 0
	let groups = [russianWordSets.easy, russianWordSets.medium, russianWordSets.hard, russianWordSets.very_hard]
	let currGroup = russianWordSets.easy

	for (const line of readRussian) {
		const wordData = line.match(matchWord)

		if (wordData == null) {
			continue
		}

		const wordType = wordData[2]

		if (wordType == 'misc' || wordType == 'prep' || wordType == 'pron') {
			continue
		}

		const word = wordData[1].toLowerCase().trim()

		if (wordType == 'adjpron' && word.length < 4) {
			continue
		}

		if (wordType == 'verb' && word.length < 4) {
			continue
		}

		if (word.length == 1) {
			continue
		}

		if (wordType != 'noun' && word.length < 4) {
			continue
		}

		//if (word.length < 4) {
			//console.log('Too short word for russian hangman: Word - ' + word + ' - length - ' + word.length + ' - type - ' + wordType)
		//s}

		i++

		if (group != (groups.length - 1) && i >= (group + 1) * 250) {
			i = 0
			group++
			currGroup = groups[group]
		}

		currGroup.push(word.replace(/ё/ig, 'е'))
	}
}

const russianSets: string[] = []

for (const index in russianWordSets) {
	russianSets.push(index)

	if (russianWordSets[index].length == 0) {
		console.error(index + ' set contains no words')
	}
}

class GuessAWordGameRussian extends GuessAWordGame {
	guessExp = /[а-яА-Я ]/i
	wordSets = russianWordSets
	setList = russianSets

	constructor() {
		super('r')
		this.addAlias('полечудес', 'чудеса')
	}
}

class GuessCommandRussian extends GuessCommand {
	help = 'Alias for }rhangman guess'
	args = '<character>'
	guessExp = /[а-яА-Я ]/i
	commandID = 'rhangman'

	constructor() {
		super('r')
		this.addAlias('угадать', 'буква', 'rg')
	}
}


class HangmanStats extends CommandBase {
	help = 'Displays statistics for selected user'
	args = '[user]'
	allowUsers = true

	constructor() {
		super('hangmanstats', 'chargamestats', 'guessawordstats', 'drownmanstats')
	}

	executed(instance: CommandExecutionInstance) {
		const user = instance.selectUser()

		if (!user) {
			return
		}

		instance.query(`SELECT * FROM "hangman_stats" WHERE "user" = ${user.id}`).then((values) => {
			if (!values.rows[0]) {
				instance.reply('No statistics found!')
				return
			}

			const row = values.rows[0]

			// "games" INTEGER NOT NULL DEFAULT 0,
			// "started" INTEGER NOT NULL DEFAULT 0,
			// "stopped" INTEGER NOT NULL DEFAULT 0,
			// "victories" INTEGER NOT NULL DEFAULT 0,
			// "defeats" INTEGER NOT NULL DEFAULT 0,

			// "guesses" INTEGER NOT NULL DEFAULT 0,
			// "guesses_hits" INTEGER NOT NULL DEFAULT 0,
			// "guesses_miss" INTEGER NOT NULL DEFAULT 0,

			// "full_guesses" INTEGER NOT NULL DEFAULT 0,
			// "full_guesses_hits" INTEGER NOT NULL DEFAULT 0,
			// "full_guesses_miss" INTEGER NOT NULL DEFAULT 0,

			// "length" INTEGER NOT NULL DEFAULT 0,
			// "length_guess" INTEGER NOT NULL DEFAULT 0

			instance.reply(`\`\`\`
Total games:                      ${row.games}
Total started games:              ${row.started}
Total stopped games:              ${row.stopped}
Total victories:                  ${row.victories}
Total defeats:                    ${row.defeats}
Total guesses:                    ${row.guesses}
Total guesses hits:               ${row.guesses_hits}
Total guesses misses:             ${row.guesses_miss}
Total full guesses:               ${row.full_guesses}
Total full guesses hits:          ${row.full_guesses_hits}
Total full guesses misses:        ${row.full_guesses_miss}
Total word length:                ${row.length}
Total guess length:               ${row.length_guess}
\`\`\``)
		})
	}
}

export {GuessAWordGame, GuessCommand, GuessCommandRussian, GuessAWordGameRussian, HangmanStats}
