const Discord = require('discord.js');
const config = require('./json/config.json');

const client = new Discord.Client( {intents: ["GUILD_MEMBERS", "GUILD_MESSAGES", "GUILDS", "DIRECT_MESSAGES", "GUILD_VOICE_STATES"], partials: ["CHANNEL"]} );

client.login(config.BOT_TOKEN);

module.exports = client

//add folder json
//add files config.json, defaultSettings.json, reminds.json (empty arr), userIds.json
//add empty sub-folders settings, voiceLogs

//default settings
// {
//     "prefix": "!",
//     "logMode": "off",
//     "logChannelId": null,
//     "welcomeMessage": null,
//     "welcomeChannelId": null,
//     "commandChannelId": null
// }

//User IDs -- define as strings
// {
//     "gymothee": ????,
//     "gabe": ????,
//     "gymotheeTest": ????
// }