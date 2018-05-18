
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

import {CommandBase, CommandExecutionInstance} from '../CommandBase'
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')
import unirest = require('unirest')

import {SteamID} from '../../../lib/SteamID'
import { BotInstance } from '../../BotInstance';

class SteamIDCommand extends CommandBase {
	help = 'Displays steamid information'
	args = '[SteamID2/SteamID64/SteamID3/User URL]'
	apiBase!: string
	resolveBase!: string

	constructor() {
		super('steamid', 'steam', 'sid', 'steam2', 'steamid2', 'steam3', 'steamid3', 'steamid64', 'steam64')
	}

	setupBot(bot: BotInstance) {
		this.apiBase = 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + bot.config.steam + '&steamids='
		this.resolveBase = 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + bot.config.steam + '&vanityurl='
	}

	resolveProfileID(id: string): Promise<SteamID> {
		return new Promise((resolve, reject) => {
			const steamid = new SteamID(id)

			if (steamid.valid()) {
				resolve(steamid)
				return
			}

			this.bot.sql.query(`SELECT * FROM "steamid_cache" WHERE "expires" > ${Math.floor(Date.now() / 1000)} AND LOWER("profileurl") = LOWER(${this.bot.sql.escapeLiteral('https://steamcommunity.com/id/' + id + '/')})`)
			.then((result) => {
				if (result.rowCount != 0) {
					const resolved = new SteamID(result.rows[0].steamid)

					if (resolved.valid()) {
						resolve(resolved)
						return
					}
				}

 				unirest.get(this.resolveBase + encodeURI(id))
				.encoding('utf-8')
				.end((result) => {
					if (!result.body || result.body == '') {
						reject('Invalid reply from ISteamUser/ResolveVanityURL API')
						return
					}

					try {
						// const json = JSON.parse(result.body)

						// if (!json.response || !json.response.success) {
						// 	reject('ISteamUser/ResolveVanityURL: Invalid Vanity ID')
						// 	return
						// }

						const json = result.body

						if (typeof json != 'object' || !json.response || json.response.success != 1) {
							reject('ISteamUser/ResolveVanityURL: Invalid Vanity ID (status code ' + json.response.success + ', message: ' + (json.response.message || '<empty>') + ')')
							return
						}

						const resolved = new SteamID(json.response.steamid)

						if (resolved.valid()) {
							resolve(resolved)
						} else {
							reject('Invalid SteamID received from ISteamUser/ResolveVanityURL API')
						}
					} catch (err) {
						console.error(err)
						console.error(result.body)
						reject(err)
					}
				})
			})
			.catch(reject)
		})
	}

	static fields = [
		"steamid",
		"communityvisibilitystate",
		"profilestate",
		"personaname",
		"lastlogoff",
		"profileurl",
		"avatar",
		"avatarmedium",
		"avatarfull",
		"personastate",
		"realname",
		"primaryclanid",
		"timecreated",
		"personastateflags",
		"loccountrycode",
		"locstatecode",
		"loccityid",
	]

	resolveSteamID(steamid: SteamID) {
		return new Promise((resolve, reject) => {
			this.bot.sql.query(`SELECT * FROM "steamid_cache" WHERE "steamid" = ${steamid.steamid64!} AND "expires" > ${Math.floor(Date.now() / 1000)}`)
			.then((values) => {
				if (values.rowCount != 0) {
					resolve(values.rows[0])
				} else {
					this.bot.sql.query(`DELETE FROM "steamid_cache" WHERE "steamid" = ${steamid.steamid64!}`)
					.then(() => {
						unirest.get(this.apiBase + encodeURI(steamid.steamid64!))
						.encoding('utf-8')
						.end((result) => {
							if (!result.body || result.body == '') {
								reject('Invalid reply from ISteamUser/GetPlayerSummaries API')
								return
							}

							try {
								// const json = JSON.parse(result.body)

								// if (!json.response || !json.response.players || !json.response.players[0]) {
								// 	reject('ISteamUser/GetPlayerSummaries: Account with specified SteamID does not exist')
								// 	return
								// }

								const json = result.body

								if (typeof json != 'object' || !json.response || !json.response.players || !json.response.players[0]) {
									reject('ISteamUser/GetPlayerSummaries: Account with specified SteamID does not exist')
									return
								}

								const player = json.response.players[0]
								const rowmap: string[] = []

								for (const field of SteamIDCommand.fields) {
									rowmap.push(player[field] && player[field] != '' && this.bot.sql.escapeLiteral(String(player[field])) || 'DEFAULT')
								}

								rowmap.push(String((Date.now() / 1000) + 3600))

								this.bot.sql.query(`INSERT INTO "steamid_cache" VALUES (${rowmap.join(',')})`)
								.then(() => {
									resolve(player)
								})
								.catch((err) => {
									console.error(err)
									console.error(`INSERT INTO "steamid_cache" VALUES (${rowmap.join(',')})`)
									reject(err)
								})
							} catch (err) {
								console.error(err)
								console.error(result.body)
								reject(err)
							}
						})
					})
					.catch(reject)
				}
			})
			.catch(reject)
		})
	}

	static profileState = [
		'Offline',
		'Online',
		'Busy',
		'Away',
		'Snooze',
		'looking to trade',
		'looking to play'
	]

	executed(instance: CommandExecutionInstance) {
		if (!instance.assert(1, 'Missing steamid')) {
			return
		}

		const steamidString = (<string> instance.get(1))
			.replace(/^https?:\/\/steamcommunity.com\/(id|profile)\//i, '')
			.replace(/\//g, '')
			.trim()

		if (steamidString.length < 3) {
			instance.error('SteamID/ID is too short', 1)
			return
		}

		this.resolveProfileID(steamidString)
		.then((steamid) => {
			this.resolveSteamID(steamid)
			.then((result: any) => {
				const reply = `\`\`\`
Nickname:            ${result.personaname}
Avatar:              ${result.avatar}
Last logoff:         ${new Date(result.lastlogoff * 1000)}
Real Name:           ${result.realname && result.realname != '' && result.realname || '<not set>'}
Location:            ${result.loccountrycode && result.loccountrycode != '' && result.loccountrycode || '<not set>'}
Status:              ${SteamIDCommand.profileState[result.personastate]}
SteamID:             ${steamid.steamid}
SteamID3:            ${steamid.steamid3}
SteamID64:           ${steamid.steamid64}
\`\`\`
${result.profileurl}`

				instance.reply(reply)
			})
			.catch((err) => {
				instance.reply('Failed to fetch data: ```\n' + err + '\n```')
			})
		})
		.catch((err) => {
			instance.reply('Failed to resolve data: ```\n' + err + '\n```')
		})
	}
}

export {SteamIDCommand}
