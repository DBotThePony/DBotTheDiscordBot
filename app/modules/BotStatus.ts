
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

import { BotInstance } from "../BotInstance"

const Statuses = [
	'in Equestria',
	'with you',
	'Team Fortress 2',
	'Garry\'s Mod',
	'Crazy Machines 2',
	'Space Engineers',
	'with memes',
	'with Rainbow Dash',
	'World of Goo',
	'FlatOut 2',
	'FlatOut 4?',
	'Node.JS',
	'on Python 2.7',
	'with C++',
	'on Keyboard',
	'game',
	'Minecraft',
	'Meincraft',
	'ModCraft',
	'IndustrialCraft V1.33.8',
	'l33t simulator',
	'inside your PC',
	'Medieval Engineers',
	'Rome: Total War I',
	'Settlers II: Vikings',
	'inside Derpibooru.org',
	'with Firefox',
	'Star Wars: Empire At War',
	'Worms: Ultimate Mayhem',
	'Spell Force 2: Gold Edition',
	'Nuclear Dawn',
	'Infinifactory',
	'Killing Floor',
	'Portal 2',
	'Distance',
	'Torchlight',
	'Torchlight II',
	'with toys on your head',
	'WATCH_DOGS 2',
	'Cinematic Mod 2013',
	'BeamNG.drive',
	'DOTA 2',
	'Counter-Strike: Source',
	'Minecraft 1.10.2',
	'Minecraft 1.7.10',
	'Minecraft Beta 1.8.1',
	'Minecraft Alpha 1.2.1',
	'Left 4 Dead 2',
	'Saints Row IV',
	'Saints Row: The Third',
	'King\'s Bounty: Crossworlds',
	'Castle Crashers',
	'Smiley',
	'The Bridge',
	'Plague Inc: Evolved',
	'Medieval Engineers',
	'Super Hexagon',
	'Borderlands 2',
	'King\'s Bounty: The Legend',
	'Crashday',
	'Crashday: Redline Edition',
	'Factorio',
]

const RegisterStatusWatchdog = (bot: BotInstance) => {
	const UpdateStatus = () => {
		const status = Statuses[Math.floor(Math.random() * (Statuses.length - 1))]
		bot.client.user.setActivity(status, {type: 'PLAYING'})
		setTimeout(UpdateStatus, (Math.random() * 120 + 120) * 1000)
	}

	UpdateStatus()
}

export {RegisterStatusWatchdog}
