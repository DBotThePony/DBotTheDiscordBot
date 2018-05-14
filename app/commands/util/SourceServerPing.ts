
//
// Copyright (C) 2017-2018 DBot.
//
// Licensed under the Apache License, Version 2.0 (the "License")
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

import dns = require('dns')
import dgram = require('dgram')

import {CommandBase, CommandExecutionInstance} from '../CommandBase'
import {CommandHolder} from '../CommandHolder'
import Discord = require('discord.js')

const sign = Buffer.from([
	0xFF, 0xFF, 0xFF, 0xFF, 0x54,
	0x53, 0x6F, 0x75, 0x72, 0x63,
	0x65, 0x20, 0x45, 0x6E, 0x67,
	0x69, 0x6E, 0x65, 0x20, 0x51,
	0x75, 0x65, 0x72, 0x79, 0x00
])

const CurTime = function() {
	return (new Date()).getTime() / 1000
}

const ReadString = function(buf: Buffer, offset: number) {
	let output = ''
	let len = 0

	while (true) {
		const readChar = buf.readUInt8(offset + len)
		len++

		if (readChar == 0) {
			break
		}

		output += String.fromCharCode(readChar)
	}

	return [output, len]
}

class SourceServerPing extends CommandBase {
	help = 'Pings source server'

	constructor() {
		super('sping')
	}

	executed(instance: CommandExecutionInstance) {
		let port = 27015
		const split = instance.raw.split(':')

		if (!split[0]) {
			instance.error('No valid IP/Domain name found!', 1)
			return
		}

		const ip = split[0]
		const possiblePort = split[1]

		const matchIP = ip.match(/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/)

		if (possiblePort) {
			const portNum = Number(split[1])

			if (portNum == portNum) {
				if (port < 43 || port >= 65565) {
					instance.error('Invalid port specified', 1)
					return
				}

				port = portNum
			} else {
				instance.error('Invalid port specified', 1)
				return
			}
		}

		if (matchIP) {
			const
				A = Number(matchIP[1]),
				B = Number(matchIP[2]),
				C = Number(matchIP[3]),
				D = Number(matchIP[4])

			const invalid =
				A != A ||
				B != B ||
				C != C ||
				D != D ||
				A < 0 || A > 255 ||
				B < 0 || B > 255 ||
				C < 0 || C > 255 ||
				D < 0 || D > 255

			if (invalid) {
				instance.error('Invalid IP specified', 1)
				return
			}

			this.ping(matchIP[0], instance, port)
			return
		}

		dns.lookup(ip, {family: 4, hints: dns.ADDRCONFIG | dns.V4MAPPED, all: false}, (err, address) => {
			if (err) {
				instance.error('Invalid DNS name specified: ' + err, 1)
				return
			}

			this.ping(address, instance, port)
		})
	}

	ping(ip: string, instance: CommandExecutionInstance, port: number) {
		const randPort = Math.floor(Math.random() * 5000) + 50000
		let Closed = false
		let sendStamp = CurTime()

		let socket = dgram.createSocket('udp4')

		socket.on('message', (buf, rinfo) => {
			try {
				let pingLatency = Math.floor((CurTime() - sendStamp) * 1000)
				let offset = 6
				const readName = ReadString(buf, offset)
				let name = readName[0]
				offset += <number> readName[1]

				const readMap = ReadString(buf, offset)
				const map = readMap[0]
				offset += <number> readMap[1]

				const readFolder = ReadString(buf, offset)
				const folder = readFolder[0]
				offset += <number> readFolder[1]

				const readGame = ReadString(buf, offset)
				const game = readGame[0]
				offset += <number> readGame[1]

				const readID = buf.readUInt16LE(offset)
				offset += 2

				const Players = buf.readUInt8(offset)
				offset += 1

				const MPlayers = buf.readUInt8(offset)
				offset += 1

				const Bots = buf.readUInt8(offset)
				offset += 1

				const Type = String.fromCharCode(buf.readUInt8(offset))
				offset += 1

				const OS = String.fromCharCode(buf.readUInt8(offset))
				offset += 1

				const Visibility = buf.readUInt8(offset)
				offset += 1

				const VAC = buf.readUInt8(offset)
				offset += 1

				const readVersion = ReadString(buf, offset)
				const Version = readVersion[0]
				offset += <number> readVersion[1]

				let output = '\n```'

				output += 'Ping to the server:      ' + Math.floor(pingLatency) + 'ms\n'
				output += 'Server IP:               ' + ip + '\n'
				output += 'Server Port:             ' + port + '\n'
				output += 'Server Name:             ' + name + '\n'
				output += 'Server current map:      ' + map + '\n'
				output += 'Server game folder:      ' + folder + '\n'
				output += 'Server game:             ' + game + '\n'
				output += 'Server game ID:          ' + readID + '\n'
				output += 'Server Current players:  ' + Players + '\n'
				output += 'Server Max players:      ' + MPlayers + '\n'
				output += 'Server Load:             ' + Players + '/' + MPlayers + ' (' + Math.floor(Players / MPlayers * 100) + '%)' + '\n'
				output += 'Server Bots:             ' + Bots + '\n'
				output += 'Server Type:             ' + (Type == 'd' && 'Dedicated' || Type == 'l' && 'Listen' || Type == 'p' && 'SourceTV' || 'WTF?') + '\n'
				output += 'Server OS:               ' + (OS == 'l' && 'Linux' || OS == 'w' && 'Windows' || OS == 'm' && 'Apple OS/X' || OS == 'o' && 'Apple OS/X' || 'WTF?') + '\n'
				output += 'Server is running VAC:   ' + (VAC == 1 && 'Yes' || 'Nope') + '\n'

				output += '\n```'

				instance.reply(output)
			} catch(err) {
				console.log(err)
				instance.reply('Internal error')
			}

			socket.close()
		})

		socket.on('listening', () => {
			socket.send(sign, 0, sign.length, port, ip)
			sendStamp = CurTime()
		})

		socket.on('error', (err) => {
			console.error(err)
			instance.reply('OSHI~ Something is bad with UDP socket...')
		})

		socket.on('close', () => {
			Closed = true
		})

		setTimeout(() => {
			if (Closed) {
				return
			}

			instance.reply('Failed to ping: Connection timeout!')
			socket.close()
		}, 4000)

		socket.bind(randPort, '0.0.0.0')
	}
}

export {SourceServerPing}
