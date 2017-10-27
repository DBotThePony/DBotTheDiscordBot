
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

import {Invite, SetAvatar, GetAvatar, About, Ping} from './base/MiscCommands'
import {XD, Leet} from './fun/MiscFun'
import {RegisterCowsay} from './fun/Cowsay'
import {RegisterRPActions} from './fun/Roleplay'

const registerDefaultCommands = function(holder: CommandHolder) {
	holder.registerCommand(new Help(holder))
	holder.registerCommand(new Eval(holder))
	holder.registerCommand(new Invite(holder))
	holder.registerCommand(new SetAvatar(holder))
	holder.registerCommand(new GetAvatar(holder))
	holder.registerCommand(new About(holder))
	holder.registerCommand(new Ping(holder))

	holder.registerCommand(new HashCommand(holder, 'MD5'))
	holder.registerCommand(new HashCommand(holder, 'SHA256'))
	holder.registerCommand(new HashCommand(holder, 'SHA1'))
	holder.registerCommand(new HashCommand(holder, 'SHA512'))

	holder.registerCommand(new XD(holder))
	holder.registerCommand(new Leet(holder))

	RegisterCowsay(holder)
	RegisterRPActions(holder)
}

export {registerDefaultCommands, Help, Eval, Invite}
