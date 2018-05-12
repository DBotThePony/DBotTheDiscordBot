
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

const avaliableColors = [
	['Amethyst', '#9b59b6'],
	['Black', '#010101'],
	['Blue', '#0000ff'],
	['Brown', '#8B4513'],
	['Carrot', '#e67e22'],
	['Chocolate', '#D2691E'],
	['Clouds', '#ecf0f1'],
	['Coral', '#FF7F50'],
	['Crimson', '#DC143C'],
	['Cyan', '#00FFFF'],
	['DarkCyan', '#008B8B'],
	['DarkGold', '#BDB76B'],
	['DarkGoldenRod', '#B8860B'],
	['DarkGreen', '#006400'],
	['DarkGreen', '#16a085'],
	['DarkMagenta', '#8B008B'],
	['DarkOlive', '#556B2F'],
	['DarkOrange', '#FF8C00'],
	['DarkRed', '#8B0000'],
	['DarkSalmon', '#E9967A'],
	['DarkViolet', '#9400D3'],
	['DeepPink', '#FF1493'],
	['DeepSkyBlue', '#00BFFF'],
	['Emerald', '#2ecc71'],
	['FireBrick', '#B22222'],
	['ForestGreen', '#228B22'],
	['Fuchsia', '#FF00FF'],
	['Gainsboro', '#DCDCDC'],
	['Gold', '#FFD700'],
	['GoldenRod', '#DAA520'],
	['Green', '#00B000'],
	['Grey', '#808080'],
	['HotPink', '#FF69B4'],
	['Indigo', '#4B0082'],
	['Khaki', '#F0E68C'],
	['Lavender', '#E6E6FA'],
	['LavenderRose', '#FF9FF7'],
	['LightGrey', '#D3D3D3'],
	['LightSkyBlue', '#87CEFA'],
	['LightYellow', '#FFFFE0'],
	['Lime', '#00ff00'],
	['LimeGreen', '#32CD32'],
	['MediumOrchid', '#BA55D3'],
	['MediumPurple', '#9370DB'],
	['MediumSlateBlue', '#7B68EE'],
	['Olive', '#808000'],
	['OliveGreen', '#6B8E23'],
	['Orange', '#FFA500'],
	['Orchid', '#DA70D6'],
	['PaleVioletRed', '#DB7093'],
	['Peru', '#CD853F'],
	['Pink', '#FFC0CB'],
	['PowderBlue', '#B0E0E6'],
	['Pumpkin', '#d35400'],
	['Purple', '#800080'],
	['Red', '#ff0000'],
	['RoyalBlue', '#4169E1'],
	['Salmon', '#FA8072'],
	['SandyBrown', '#F4A460'],
	['SeaGreen', '#2E8B57'],
	['Sienna', '#A0522D'],
	['Silver', '#bdc3c7'],
	['SkyBlue', '#87CEEB'],
	['SlateGrey', '#708090'],
	['SteelBlue', '#4682B4'],
	['SunFlower', '#f1c40f'],
	['Teal', '#008080'],
	['Thistle', '#D8BFD8'],
	['Violet', '#EE82EE'],
]

const colorNames: string[] = []

for (const data of avaliableColors) {
	colorNames.push(data[0])
}

class ColorsCommand extends CommandBase {
	help = 'Displays avaliable colors'
	allowPM = false

	constructor() {
		super('colors')
	}

	executed(instance: CommandExecutionInstance) {
		instance.reply('Avaliable colors are: ' + colorNames.join(', '))
	}
}

class ReloadColors extends CommandBase {
	help = 'Reloads color roles on the server (creates missing color roles and also enabling colors on the server)'
	allowPM = false

	constructor() {
		super('reloadcolors')
	}

	executed(instance: CommandExecutionInstance) {
		if (instance.member && !instance.member.hasPermission('MANAGE_ROLES')) {
			instance.reply('You lack MANAGE_ROLES permission to execute this command!')
			return
		}

		if (instance.server && instance.server.me && !instance.server.me.hasPermission('MANAGE_ROLES')) {
			instance.reply('Bot is missing MANAGE_ROLES permission!')
			return
		}

		const server = <Discord.Guild> instance.server

		instance.query(`SELECT "colors" FROM "server_colors" WHERE "server" = '${server.id}'`)
		.then((values) => {
			const freshRun = values.rowCount == 0

			let rolesToCreate: any[]
			let createdRoles: Discord.Role[] = []

			if (freshRun) {
				rolesToCreate = avaliableColors
			} else {
				const arr = values.rows[0].colors
				rolesToCreate = []

				for (const data of avaliableColors) {
					rolesToCreate.push([data[0], data[1], true])
				}

				for (const [id, role] of server.roles) {
					if (arr.includes(id)) {
						rolesToCreate[arr.indexOf(id)][2] = false
						createdRoles[arr.indexOf(id)] = role
					}
				}
			}

			if (rolesToCreate.length == 0) {
				instance.reply('No roles to create')
				return
			}

			if (!freshRun) {
				let hit = false

				for (const data of rolesToCreate) {
					if (data[2]) {
						hit = true
						break
					}
				}

				if (!hit) {
					instance.reply('No roles to create')
					return
				}
			}

			let nextid = 0

			const iterateOver = () => {
				const roledata = rolesToCreate[nextid]

				if (!roledata) {
					const idarray: string[] = []

					for (const role of createdRoles) {
						idarray.push(role.id)
					}

					instance.query(`INSERT INTO "server_colors" VALUES ('${server.id}', '{${idarray.join(',')}}') ON CONFLICT ("server") DO UPDATE SET "colors" = excluded."colors"`)
					.then(() => {
						instance.reply('Roles were created successfully.')
					})

					return
				}

				if (!freshRun && !roledata[2]) {
					nextid++
					iterateOver()
					return
				}

				server.createRole({
					permissions: [],
					mentionable: false,
					hoist: false,
					color: roledata[1],
					name: 'Color: ' + roledata[0]
				})
				.then((role: Discord.Role) => {
					createdRoles[nextid] = role

					if (rolesToCreate[nextid + 1]) {
						nextid++
						// setInterval(iterateOver, 1500)
						iterateOver()
					} else {
						const idarray: string[] = []

						for (const role of createdRoles) {
							idarray.push(role.id)
						}

						instance.query(`INSERT INTO "server_colors" VALUES ('${server.id}', '{${idarray.join(',')}}') ON CONFLICT ("server") DO UPDATE SET "colors" = excluded."colors"`)
						.then(() => {
							instance.reply('Roles were created successfully.')
						})
					}
				})
				.catch((err) => {
					instance.reply(err)
				})
			}

			iterateOver()
		})
	}
}

class RemoveColors extends CommandBase {
	help = 'Removes color roles from the server and disables them'
	allowPM = false

	constructor() {
		super('removecolors')
	}

	executed(instance: CommandExecutionInstance) {
		if (instance.member && !instance.member.hasPermission('MANAGE_ROLES')) {
			instance.reply('You lack MANAGE_ROLES permission to execute this command!')
			return
		}

		if (instance.server && instance.server.me && !instance.server.me.hasPermission('MANAGE_ROLES')) {
			instance.reply('Bot is missing MANAGE_ROLES permission!')
			return
		}

		const server = <Discord.Guild> instance.server

		instance.query(`SELECT "colors" FROM "server_colors" WHERE "server" = '${server.id}'`)
		.then((values) => {
			if (values.rowCount == 0) {
				instance.reply('No roles to remove')
				return
			}

			const arr = values.rows[0].colors

			let nextid = 0

			const iterateOver = () => {
				if (server.roles.has(arr[nextid])) {
					(<Discord.Role> server.roles.get(arr[nextid]))
					.delete('Colors removal by <@' + (<Discord.User> instance.author).id + '>')
					.then((role: Discord.Role) => {
						if (arr[nextid + 1]) {
							nextid++
							// setInterval(iterateOver, 1500) // discord.js should handle this
							iterateOver()
						} else {
							instance.query(`DELETE FROM "server_colors" WHERE "server" = '${server.id}'`)
							.then(() => {
								instance.reply('Roles were removed successfully.')
							})
						}
					})
					.catch((err) => {
						instance.reply(err)
					})
				} else {
					nextid++

					if (nextid >= arr.length) {
						instance.query(`DELETE FROM "server_colors" WHERE "server" = '${server.id}'`)
						.then(() => {
							instance.reply('Roles were removed successfully.')
						})

						return
					}

					iterateOver()
				}
			}

			iterateOver()
		})
	}
}

class ColorCommand extends CommandBase {
	help = 'Sets your color (if server has colors enabled)'
	allowPM = false

	constructor() {
		super('color')
	}

	executed(instance: CommandExecutionInstance) {
		if (instance.server && instance.server.me && !instance.server.me.hasPermission('MANAGE_ROLES')) {
			instance.reply('Bot is missing MANAGE_ROLES permission!')
			return
		}

		let color = instance.raw.toLowerCase()

		if (color == '') {
			instance.reply('No color specified!')
			return
		}

		let colorID = 0
		let found = false

		for (const data of avaliableColors) {
			if (data[0].toLowerCase() == color) {
				found = true
				break
			}

			colorID++
		}

		if (!found) {
			instance.error('Invalid color specified. To see the list of avaliable colors, use "colors" command', 1)
			return
		}

		const server = <Discord.Guild> instance.server

		instance.query(`SELECT "colors" FROM "server_colors" WHERE "server" = '${server.id}'`)
		.then((values) => {
			if (values.rowCount == 0) {
				instance.reply('Server has no colors enabled!')
				return
			}

			const arr = values.rows[0].colors

			if (!arr[colorID]) {
				instance.reply('what the fuck with colors array. Ask administrator to }reloadcolors')
				return
			}

			const member = <Discord.GuildMember> instance.member

			if (member.roles.has(arr[colorID])) {
				instance.reply('You already have that color!')
				return
			}

			if (!server.roles.has(arr[colorID])) {
				instance.reply('Target role was removed by server administrator or something :\\')
				return
			}

			const role = <Discord.Role> server.roles.get(arr[colorID])

			for (const userRole of member.roles.values()) {
				if (arr.includes(userRole.id)) {
					member.removeRole(userRole)
				}
			}

			member.addRole(role, 'Color command').then(() => {
				instance.reply('Role added successfully')
			}).catch((err) => {instance.reply('```\n' + err + '\n```')})
		})
	}
}

export {ColorCommand, ColorsCommand, ReloadColors, RemoveColors}
