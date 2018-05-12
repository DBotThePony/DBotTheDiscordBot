
//
// Copyright (C) 2017 DBot.
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
import {HashCommand} from './base/Util'
import {CommandHolder} from './CommandHolder'

import {Invite, SetAvatar, GetAvatar, About, Ping, DateCommand} from './base/MiscCommands'
import {XD, Leet} from './fun/MiscFun'
import {RegisterCowsay} from './fun/Cowsay'
import {RegisterRPActions} from './fun/Roleplay'
import {SourceServerPing} from './util/SourceServerPing'
import {ColorCommand, ColorsCommand, ReloadColors, RemoveColors} from './util/ColorCommand'

const registerDefaultCommands = function(holder: CommandHolder) {
	holder.registerCommand(new Help())
	holder.registerCommand(new Eval())
	holder.registerCommand(new Invite())
	holder.registerCommand(new SetAvatar())
	holder.registerCommand(new GetAvatar())
	holder.registerCommand(new About())
	holder.registerCommand(new Ping())
	holder.registerCommand(new DateCommand())

	holder.registerCommand(new ColorCommand())
	holder.registerCommand(new ColorsCommand())
	holder.registerCommand(new ReloadColors())
	holder.registerCommand(new RemoveColors())

	holder.registerCommand(new HashCommand('MD5'))
	holder.registerCommand(new HashCommand('SHA256'))
	holder.registerCommand(new HashCommand('SHA1'))
	holder.registerCommand(new HashCommand('SHA512'))

	holder.registerCommand(new XD())
	holder.registerCommand(new Leet())
	holder.registerCommand(new SourceServerPing())

	RegisterCowsay(holder)
	RegisterRPActions(holder)
}

export {registerDefaultCommands, Help, Eval, Invite}
