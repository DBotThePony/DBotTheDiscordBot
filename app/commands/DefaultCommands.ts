
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

import {Help} from './base/Help'
import {Eval} from './base/Eval'
import {HashCommand, ServerOwnerCommand, PermissionsList, AdminList, ServerInfo} from './base/Util'
import {CommandHolder} from './CommandHolder'

import {Invite, SetAvatar, GetAvatar, About, Ping, DateCommand, BotInfoCommand} from './base/MiscCommands'
import {CMDManip} from './base/CommandManip'
import {Retry} from './base/Retry'
import {XD, Leet} from './fun/MiscFun'
import {GuessAWordGame, GuessCommand, GuessCommandRussian, GuessAWordGameRussian, HangmanStats} from './games/GuessAWord'
import {RegisterCowsay} from './fun/Cowsay'
import {ShippingCommand} from './fun/Shipping'
import {WordWallCommand} from './fun/text/WordWall'
import {RollTheDice} from './fun/text/RollTheDice'
import {ASCIIPonyCommand, ASCIIPonyImageCommand} from './fun/text/ASCIIPony'
import {Fortune, VulgarFortune, CopyPasta, Intel, NoIntel, Pogreb} from './fun/text/Fortune'
import {RegisterRPActions} from './fun/Roleplay'
import {WastedCommand, YouDied} from './image/Wasted'
import {NFS} from './fun/Misc'
import {Aesthetics, TextFlip, TextFlop} from './fun/text/TextManip'
import {SourceServerPing} from './util/SourceServerPing'
import {SteamIDCommand} from './util/SteamID'
import {ColorCommand, ColorsCommand, ReloadColors, RemoveColors} from './util/ColorCommand'
import { RatedByCommand } from './image/RatedBy';

const registerDefaultCommands = function(holder: CommandHolder) {
	holder.registerCommand(new Help())
	holder.registerCommand(new Eval())
	holder.registerCommand(new Invite())
	holder.registerCommand(new SetAvatar())
	holder.registerCommand(new About())
	holder.registerCommand(new Ping())
	holder.registerCommand(new DateCommand())
	holder.registerCommand(new Retry())
	holder.registerCommand(new BotInfoCommand())
	holder.registerCommand(new CMDManip(true))
	holder.registerCommand(new CMDManip(true, true))
	holder.registerCommand(new CMDManip(false))

	holder.setCategory('colors', 'util')
	holder.registerCommand(new ColorCommand())
	holder.registerCommand(new ColorsCommand())
	holder.registerCommand(new ReloadColors())
	holder.registerCommand(new RemoveColors())

	holder.setCategory('hash')
	holder.registerCommand(new HashCommand('MD5'))
	holder.registerCommand(new HashCommand('SHA256'))
	holder.registerCommand(new HashCommand('SHA1'))
	holder.registerCommand(new HashCommand('SHA512'))

	holder.setCategory('games', 'fun_text', 'fun')
	holder.registerCommand(new GuessAWordGame())
	holder.registerCommand(new GuessCommand())
	holder.registerCommand(new GuessAWordGameRussian())
	holder.registerCommand(new GuessCommandRussian())
	holder.registerCommand(new HangmanStats())

	holder.setCategory('fun', 'images')
	holder.registerCommand(new NFS())
	holder.registerCommand(new YouDied())
	holder.registerCommand(new RatedByCommand())
	holder.registerCommand(new WastedCommand())
	holder.registerCommand(new WastedCommand('cactus', 'you got cocky, mate'))

	holder.setCategory('fun_text', 'fun')
	holder.registerCommand(new WordWallCommand())
	holder.registerCommand(new XD())
	holder.registerCommand(new Leet())

	holder.registerCommand(new Aesthetics())
	holder.registerCommand(new TextFlip())
	holder.registerCommand(new TextFlop())

	holder.registerCommand(new RollTheDice())

	RegisterCowsay(holder)

	holder.setCategory('util')
	holder.registerCommand(new SourceServerPing())
	holder.registerCommand(new ServerOwnerCommand())
	holder.registerCommand(new PermissionsList())
	holder.registerCommand(new AdminList())
	holder.registerCommand(new GetAvatar())
	holder.registerCommand(new ServerInfo())

	if (holder.bot.config.steam_enable) {
		holder.registerCommand(new SteamIDCommand())
	}

	holder.setCategory('roleplay', 'ponystuff')
	RegisterRPActions(holder)

	holder.setCategory('ponystuff')
	holder.registerCommand(new ShippingCommand())
	holder.registerCommand(new ASCIIPonyCommand())
	holder.registerCommand(new ASCIIPonyImageCommand())

	holder.setCategory('quotes')
	holder.registerCommand(new Fortune())
	holder.registerCommand(new VulgarFortune())
	holder.registerCommand(new CopyPasta())

	holder.registerCommand(new Intel())
	holder.registerCommand(new NoIntel())
	holder.registerCommand(new Pogreb())
}

export {registerDefaultCommands, Help, Eval, Invite}
