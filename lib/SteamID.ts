
//
// Copyright (C) 2017 DBot
//
// Licensed under the Apache License, Version 2.0 (the "License")
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import BigNumber = require('bignumber.js')

const SteamIDTo64 = function(id: string): [string, number] {
    let server = 0
    let AuthID = 0

    let split = id.split(':')

    server = Number(split[1])
    AuthID = Number(split[2])

    let Mult = AuthID * 2

    let one = new BigNumber.BigNumber('76561197960265728')
    let two = new BigNumber.BigNumber(Mult)
	let three = new BigNumber.BigNumber(server)

    return [one.plus(two).plus(three).toString(10), server]
}

const SteamIDFrom64 = function(id: string): [string, number] {
    let newNum = new BigNumber.BigNumber(id)
    let num = Number(newNum.minus(new BigNumber.BigNumber('76561197960265728')).toString(10))

    let server = num % 2
    num = num - server

    return ['STEAM_0:' + server + ':' + (num / 2), server]
}

const SteamIDTo3 = function(id: string): [string, number] {
    let server = 0
    let AuthID = 0

    let split = id.split(':')

    server = Number(split[1])
    AuthID = Number(split[2])

    return ['[U:1:' + (AuthID * 2 + server) + ']', server]
}

const SteamIDFrom3 = function(id: string): [string, number] {
    let sub = id.substr(1, id.length - 2)
    let split = sub.split(':')

    let uid = Number(split[2])

    let server = uid % 2
    uid = uid - server

    return ['STEAM_0:' + server + ':' + (uid / 2), server]
}

const SteamIDFrom64To3 = function(id: string) {
    const [steamid, server] = SteamIDFrom64(id)
    return SteamIDTo3(steamid)
}

const SteamIDFrom3To64 = function(id: string) {
    const [steamid, server] = SteamIDFrom3(id)
    return SteamIDTo64(steamid)
}

class SteamID {
    protected _steamid: string | null = null
    protected _steamid3: string | null = null
    protected _steamid64: string | null = null
    protected _server: number | null = null

    get server(): number | null { return this._server }
    get steamid(): string | null { return this._steamid }
    get steamid3(): string | null { return this._steamid3 }
    get steamid64(): string | null { return this._steamid64 }

    set steamid(steamidIn: string | null) {
        if (steamidIn) {
            this.setupSteamID(steamidIn)
        } else {
            this.reset()
        }
    }

    set steamid3(steamidIn: string | null) {
        if (steamidIn) {
            this.setupSteamID3(steamidIn)
        } else {
            this.reset()
        }
    }

    set steamid64(steamidIn: string | null) {
        if (steamidIn) {
            this.setupSteamID64(steamidIn)
        } else {
            this.reset()
        }
    }

    reset () {
        this._server = null
        this._steamid = null
        this._steamid3 = null
        this._steamid64 = null
        return this
    }

    setupSteamID3 (steamidIn: string) {
        try {
            const [steamid, server] = SteamIDFrom3(steamidIn)
            const [steamid64, server64] = SteamIDTo64(steamid)
            this._steamid3 = steamidIn
            this._steamid = steamid
            this._server = server
            this._steamid64 = steamid64
        } catch(err) {
            console.error(`Attempt to parse bad SteamID: ${steamidIn} (was detected as SteamID3)`)
            console.error(err)
        }
    }

    setupSteamID (steamidIn: string) {
        try {
            const [steamid3, server] = SteamIDTo3(steamidIn)
            const [steamid64, server64] = SteamIDTo64(steamidIn)
            this._steamid3 = steamid3
            this._steamid = steamidIn
            this._server = server
            this._steamid64 = steamid64
        } catch(err) {
            console.error(`Attempt to parse bad SteamID: ${steamidIn} (was detected as SteamID2)`)
            console.error(err)
        }
    }

    setupSteamID64 (steamidIn: string) {
        try {
            const [steamid3, server] = SteamIDFrom64To3(steamidIn)
            const [steamid, server64] = SteamIDFrom64(steamidIn)
            this._steamid3 = steamid3
            this._steamid = steamid
            this._server = server
            this._steamid64 = steamidIn
        } catch(err) {
            console.error(`Attempt to parse bad SteamID: ${steamidIn} (was detected as SteamID64)`)
            console.error(err)
        }
    }

    setup (steamidIn: string) {
        steamidIn = String(steamidIn)

        if (steamidIn.substr(0, 2) === '[U') {
            this.setupSteamID3(steamidIn)
        } else if (steamidIn.substr(0, 7) === 'STEAM_0') {
            this.setupSteamID(steamidIn)
        } else {
            this.setupSteamID64(steamidIn)
        }

        return this
    }

    constructor (steamidIn?: string) {
        this.reset()

        if (steamidIn) {
            this.setup(steamidIn)
        }
    }

    equals (target: SteamID | string) {
        if (typeof target == 'object') {
            return this.steamid == target.steamid ||
                this.steamid3 == target.steamid3 ||
                this.steamid3 == target.steamid3
        } else {
            target = target.trim()
            return this.steamid == target ||
                this.steamid3 == target ||
                this.steamid3 == target
        }
    }
}

import crypto = require('crypto')

class BotSteamID extends SteamID {
    protected _botName: string
    protected _steamid: string
    protected _steamid3: string
    protected _steamid64: string

    constructor (botName: string) {
        super()
        this._botName = botName
        const stream = crypto.createHash('md5')
        stream.update(botName)
        const hex = stream.digest('hex')
        this._steamid = 'STEAM_1:' + hex
        this._steamid3 = '[U:1:' + hex + ']'
        this._steamid64 = '76561197960265728'
    }

    get steamid(): string { return this._steamid }
    get steamid3(): string { return this._steamid3 }
    get steamid64(): string { return this._steamid64 }

    set steamid(steamidIn: string) { }
    set steamid3(steamidIn: string) { }
    set steamid64(steamidIn: string) { }
    get botName () { return this._botName }

    reset () { return this }
    setup () { return this }
}

export {SteamID, BotSteamID, SteamIDTo64, SteamIDFrom64, SteamIDTo3, SteamIDFrom3, SteamIDFrom64To3, SteamIDFrom3To64}
