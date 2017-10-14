
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
import {Invite, SetAvatar} from './base/MiscCommands'
import {CommandHolder} from './CommandHolder'

const registerDefaultCommands = function(holder: CommandHolder) {
	holder.registerCommand(new Help(holder))
	holder.registerCommand(new Eval(holder))
	holder.registerCommand(new Invite(holder))
	holder.registerCommand(new SetAvatar(holder))
}

export {registerDefaultCommands, Help, Eval, Invite}
