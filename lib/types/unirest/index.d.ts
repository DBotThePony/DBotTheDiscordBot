
//
// Copyright (C) 2017 DBot
//
// Licensed under the Apache License, Version 2.0 (the "License");
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

declare module "unirest" {
    import fs = require('fs');
    import http = require('http');
    import https = require('https');
    import net = require('net');

    interface CookieJar {
        add (keyvalue: string, path: string): this;
    }

    interface AWS {
        key: string;
        secret: string;
        bucket: string;
    }

    interface OAuth {
        callback?: string;
        token?: string;
        verifier?: string;
        consumer_key: string;
        consumer_secret: string;
    }

    interface OptionsObject {
        url: string | object;
        body: string | object;
        encoding: 'utf-8' | null;
        form: object;
        auth: object;
        multipart: object;
        followAllRedirects: boolean;
        forever : boolean | undefined;
        followRedirect: boolean;
        jar: boolean | CookieJar;
        strictSSL: boolean;
        maxRedirects: number;
        timeout: number;
        method : 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE';
        qs: object;
        headers: object;
        oauth: OAuth;
        aws: AWS;
        httpSignature: object;
        hawk: object;
        pool: object;
        proxy: string;
        secureProtocol: string;
        localAddress: string;
    }

    interface RequestAuth {
        user: string;
        pass: string;
        sendImmediately: boolean;
    }

    interface Result {
        body: any;
        raw_body: string | Buffer;
        headers: object;
        cookies: object;
        httpVersion: string;
        httpVersionMajor: string;
        httpVersionMinor: string;
        url: string;
        domain: string | null;
        method: string | null;
        client: http.ClientRequest; // ???
        connection: http.ClientRequest; // ???
        socket: net.Socket;
        request: Request;
        setEncoding (val: 'utf-8' | null): void;

        code: number;
        status: number;

        statusType: 1 | 2 | 3 | 4 | 5;
        info: boolean;
        ok: boolean;
        clientError: boolean;
        serverError: boolean;
        accepted: boolean;
        noContent: boolean;
        badRequest: boolean;
        unauthorized: boolean;
        notAcceptable: boolean;
        notFound: boolean;
        notFoforbidden: boolean;
        error: boolean | object;
    }

    interface AttachData {
        file: string;
        'relative file'?: fs.ReadStream;
        'remote file'?: Request;
    }

    interface __As {
        json (callback: (response: Result) => void): this;
        binary (callback: (response: Result) => void): this;
        string (callback: (response: Result) => void): this;
    }

    interface Request {
        headers (values: object): this;
        header (name: string, value: string): this;
        header (name: string): string | undefined;
        set (name: string, value: string): this;
        set (name: string): string | undefined;
        headers (name: string, value: string): this;
        headers (name: string): string | undefined;
        auth (obj: RequestAuth): this;
        auth (user: string, pass: string, sendImmediately: boolean): this;
        end (callback: (result: Result) => void): this;
        complete (callback: (result: Result) => void): this;
        method (type: 'GET' | 'POST' | 'PUT' | 'HEAD' | 'PATCH' | 'DELETE'): this;
        form (values: object): this;
        httpSignature (values: object): this;
        maxRedirects (val: number): this;
        redirects (val: number): this;
        timeout (val: number): this;
        proxy (val: string): this;
        encoding (val: 'utf-8' | null): this;
        followRedirect (val: boolean): this;
        redirect (val: boolean): this;
        strictSSL (val: boolean): this;
        ssl (val: boolean): this;
        oauth (val: OAuth): this;
        localAddress (val: string): this;
        ip (val: string): this;
        pool (val: object): this;
        forever (val: boolean): this;
        options: OptionsObject;
        as: __As;
    }

    interface UnirestPost extends Request {
        query (params: object | string): this;
        send (params: object | string): this;
        type (params: string): this;
        attach (value: AttachData): this;
        attach (name: string, path: string): this;
        field (values: object): this;
        field (name: string, path: string): this;
    }

    interface UnirestGet extends Request { }
    interface UnirestPatch extends Request { }
    // interface UnirestDelete extends Request { }

    export function url (url: string): Request;
    export function get (url: string): UnirestGet;
    export function post (url: string): UnirestPost;
    export function patch (url: string): UnirestPatch;
    // export function delete (url: string): UnirestDelete;
    export function jar (): CookieJar;
}
