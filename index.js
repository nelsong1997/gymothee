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

client.on("ready", () => ready())

client.on("messageCreate", (message) => {
    try {
        messageCreate(message)
    } catch (err) {
        console.log(`I had trouble with this message:\n${message}\n${error}`)
    }
})

client.on("voiceStateUpdate", (oldMember, newMember) => voiceStateUpdate(oldMember, newMember))

client.on("guildMemberAdd", (member) => guildMemberAdd(member))

client.on("guildCreate", (guild) => guildCreate(guild))

// client.on("messageDelete", (message) => console.log(message.content)) //considering message un-delete function