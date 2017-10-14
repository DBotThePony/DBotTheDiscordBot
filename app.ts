
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

const stamp = (new Date()).getTime()
import {ConfigInstance} from './app/ConfigInstance'
import {BotInstance} from './app/BotInstance'
require('./lib/ArrayUtil')

process.env['PATH'] = './bin;' + process.env['PATH']

const options = {
	autoReconnect: true
}

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception: ', err)
})

let cfg
let mainBotInstance

console.log('Initializing bot...')

try {
	cfg = new ConfigInstance(require('./config.js'))
} catch(err) {
	console.error('---------------------------------------')
	console.error('FATAL: Unable to load config file')
	console.error('---------------------------------------')
	console.error(err)
	process.exit(1)
}

if (cfg) {
	console.log('Found config - token is ' + cfg.token.substr(1, 6) + '<...>; Logging in...')

	try {
		mainBotInstance = new BotInstance(cfg, true)
	} catch(err) {
		console.error('---------------------------------------')
		console.error('FATAL: Unable to start main bot instance')
		console.error('---------------------------------------')
		console.error(err)
		process.exit(1)
	}
}
