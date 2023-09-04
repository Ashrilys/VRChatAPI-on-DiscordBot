## VRChat Api Discord Call

A Discord bot that allows interaction with the VRChat API.

### Features

- **Authentication**: Manage authentication using a code system.
- **Slash Commands**: 
  - `/grade`: Get your VRChat rank.

### Dependencies

| Package Name              | Version   |
|--------------------------|-----------|
| `@discordjs/builders`    | `^1.6.5`  |
| `discord.js`             | `^14.13.0`|
| `undici`                 | `^0.0.2`  |

### Setup

1. Clone this repository.
2. Install the dependencies with `npm install`.
3. Configure your `config.json` for authentication.
4. Run the bot with `node bot.js`.

### Authentication

#### Script

For authentication, you will need a file to generate your VRChat token and cookie:

```JS
// ... [Content of the auth.js file]
```

When you run the script with the `auth.js` command, the console will ask for your username and password. Fill them out, and then the script will generate a `config.json` in which it will store the information.

Once the script stops and the information is written to the config, run the script a second time to activate 2FA this time. When the script asks you for the 2FA code, enter it, and it will finish generating what you need.

#### Config File

This is what the config file will look like:

```json
{
    "username": "username",
    "password": "password",
    "auth": "authcookie_xxxxxxxxx",
    "codetype": "emailotp",
    "code": "xxxxxxx",
    "twofa": "xxxxxxxxxxxxxxxxxxxxx"
}
```

You can delete the `username` and `password` fields and keep the rest. This file will authenticate you on the API for each of your VRChat projects!

### License

This project is under the MIT license. 
