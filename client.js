const { Client, GatewayIntentBits, Partials } = require('discord.js');
const config = require('./json/config.json');

const client = new Client (
    {
        intents: [
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildMessageReactions
        ],
        partials: [Partials.Channel, Partials.Message, Partials.Reaction]
    }
)

client.login(config.BOT_TOKEN);

module.exports = client

//add folder json
//add files config.json, defaultSettings.json, reminds.json (empty arr), userIds.json
//add empty sub-folders settings, rules

//default settings
// {
//     "prefix": "!",
//     "logMode": "off",
//     "logChannelId": null,
//     "welcomeMessage": null,
//     "welcomeChannelId": null,
//     "commandChannelId": null,
//     "commandSecurity": false
// }

//User IDs -- define as strings
// {
//     "gymothee": ????,
//     "gabe": ????,
//     "gymotheeTest": ????
// }