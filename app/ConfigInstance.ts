
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

interface SQLData {
	sql_hostname: string
	sql_port?: number
	sql_user: string
	sql_password: string
	sql_database: string
	sql_workers?: number
}

interface ConfigData {
	token: string
	google: string
	google_enable: boolean
	steam: string
	steam_enable: boolean

	sql_hostname?: string
	sql_port?: number
	sql_user?: string
	sql_password?: string
	sql_database?: string
	sql_workers?: number
	webroot: string
	webpath: string
	protocol: string
	owners: string[]
}

class SQLConfig implements SQLData {
	sql_hostname: string
	sql_port: number
	sql_user: string
	sql_password: string
	sql_database: string
	sql_workers: number
	hostname: string
	port: number
	user: string
	password: string
	database: string
	workers: number

	constructor(inputData: SQLData) {
		this.sql_hostname = inputData.sql_hostname
		this.sql_port = inputData.sql_port || 5432
		this.sql_user = inputData.sql_user
		this.sql_password = inputData.sql_password
		this.sql_database = inputData.sql_database
		this.sql_workers = inputData.sql_workers || 1

		this.hostname = inputData.sql_hostname
		this.port = inputData.sql_port || 5432
		this.user = inputData.sql_user
		this.password = inputData.sql_password
		this.database = inputData.sql_database
		this.workers = inputData.sql_workers || 1
	}

	getSQL() {
		const {
			hostname, port, user, password, database
		} = this
		return {
			hostname, port, user, password, database
		}
	}
}

class ConfigInstance implements ConfigData {
	data: ConfigData
	token: string
	google: string
	google_enable: boolean
	steam: string
	steam_enable: boolean
	sql_hostname?: string
	sql_port?: number
	sql_user?: string
	sql_password?: string
	sql_database?: string
	sql_workers?: number
	webroot: string
	webpath: string
	protocol: string
	owners: string[]
	sql_config: SQLConfig | null = null

	constructor(inputData: ConfigData) {
		this.data = inputData
		this.token = inputData.token
		this.google = inputData.google
		this.google_enable = inputData.google_enable
		this.steam = inputData.steam
		this.steam_enable = inputData.steam_enable
		this.sql_hostname = inputData.sql_hostname
		this.sql_port = inputData.sql_port
		this.sql_user = inputData.sql_user
		this.sql_password = inputData.sql_password
		this.sql_database = inputData.sql_database
		this.sql_workers = inputData.sql_workers
		this.webroot = inputData.webroot
		this.webpath = inputData.webpath
		this.protocol = inputData.protocol
		this.owners = inputData.owners

		if (this.isValidSQL()) {
			this.sql_config = new SQLConfig(<any> inputData)
		}
	}

	isValidSQL() {
		return this.sql_user != undefined && this.sql_password != undefined && this.sql_database != undefined
	}

	getSQL() {
		return this.sql_config && this.sql_config.getSQL()
	}
}

export {ConfigInstance, SQLConfig, ConfigData, SQLData}
