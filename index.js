//client
const client = require('./client.js')

//server
const port = 5000
const app = require('./server.js')
app.listen(port, () => console.log(`Listening on port ${port}!`))

//handlers
const ready = require('./handlers/ready.js')
const messageCreate = require('./handlers/messageCreate.js')
const voiceStateUpdate = require('./handlers/voiceStateUpdate.js')
const guildMemberAdd = require('./handlers/guildMemberAdd.js')
const guildCreate = require('./handlers/guildCreate.js')
const messageReactionAdd = require('./handlers/messageReactionAdd.js')
const messageReactionRemove = require('./handlers/messageReactionRemove.js')

client.on("ready", () => ready())

client.on("messageCreate", (message) =>  messageCreate(message))

client.on("voiceStateUpdate", (oldMember, newMember) => voiceStateUpdate(oldMember, newMember))

client.on("guildMemberAdd", (member) => guildMemberAdd(member))

client.on("guildCreate", (guild) => guildCreate(guild))

client.on("messageReactionAdd", (messageReaction, user) => messageReactionAdd(messageReaction, user))

client.on("messageReactionRemove", (messageReaction, user) => messageReactionRemove(messageReaction, user))