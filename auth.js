const { writeFileSync } = require("fs");
const { request } = require("undici");
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});


new (class Auth {

    config = {}

    constructor() {
        try {
            this.config = require('./config.json')
        } catch { }
        this.init();
    }

    async init() {
        try {
            if (!this.config.twofa && this.config.auth)
                await this.code();
            else if (!this.config.twofa && !this.config.auth)
                await this.auth();
            else console.log('Alrerady connected.');


            console.log(this.config);
            writeFileSync('./config.json', JSON.stringify(this.config), 'utf-8');
        } catch (err) { console.error(err) }
        process.exit(0);
    }

    async code() {
        const code = await new Promise(r => readline.question(`Code (${this.config.codetype})? `, name => r(name)));
        const response = await request(`https://api.vrchat.cloud/api/1/auth/twofactorauth/${this.config.codetype}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `auth=${this.config.auth}`,
                'user-agent': 'Mozilla/5.0'
            },
            body: JSON.stringify({ code })
        });
        if (response.statusCode !== 200)
            throw 'Invalid Code';
        const json = await response.body.json();
        if (json.error || !json.verified)
            throw json.error?.message || 'Not verified';
        this.config.twofa = response.headers['set-cookie'].split('twoFactorAuth=')[1].split(';')[0];
        this.config.code = code;
        console.log('Connected !');
    }

    async auth() {
        const username = await new Promise(r => readline.question(`Username? `, name => r(name)));
        const password = await new Promise(r => readline.question(`Password? `, name => r(name)));
        console.log(username, password, '...')
        const response = await request('https://api.vrchat.cloud/api/1/auth/user', {
            headers: {
                'user-agent': 'Mozilla/5.0',
                'Authorization': `Basic ${Buffer.from(username + `:` + password).toString('base64')}`
            }
        });
        const json = await response.body.json();
        if (json.error)
            throw json.error.message;
        this.config = {
            username, password,
            auth: response.headers['set-cookie'].split('auth=')[1].split(';')[0],
            codetype: json.requiresTwoFactorAuth[0]?.toLowerCase() || 'emailotp',
            code: null,
            twofa: null
        };
        console.log(json.requiresTwoFactorAuth ? 'Please verif code 2fa.' : 'Connected')
    }
})()
// console.log(username || 'NONE', password || 'NONE', code || 'NONE');

// const out = (async () => {
//     if (!code) {
//
//         console.log(response.statusCode, json, response.headers['set-cookie'])
//     } else {
//         const response = await request('https://api.vrchat.cloud/api/1/auth/user', {
//             headers: {
//                 'user-agent': 'Mozilla/5.0',
//                 'Authorization': `Basic ${Buffer.from(username + `:` + password).toString('base64')}`
//             }
//         });
//     }
// })();