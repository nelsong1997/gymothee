const Discord = require('discord.js');
const config = require('./json/config.json');

const client = new Discord.Client( {intents: ["GUILD_MEMBERS", "GUILD_MESSAGES", "GUILDS", "DIRECT_MESSAGES", "GUILD_VOICE_STATES"], partials: ["CHANNEL"]} );

client.login(config.BOT_TOKEN);

module.exports = client