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

client.on("ready", () => ready())

client.on("messageCreate", (message) => messageCreate(message))

client.on("voiceStateUpdate", (oldMember, newMember) => voiceStateUpdate(oldMember, newMember))

client.on("guildMemberAdd", (member) => guildMemberAdd(member))