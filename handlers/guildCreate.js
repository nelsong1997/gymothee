//client
const client = require('../client.js')

//helpers
const sendDm = require('../helpers/sendDm.js')
const findUser = require('../helpers/findUser.js')

//json
const userIds = require('../json/userIds.json')

async function guildCreate(guild) {
    let creator = await findUser(guild.ownerId)
    let creatorStr = creator ? `${creator.username}` : "Not found"
    sendDm(
        userIds.gabe,
        `I was added to a new guild!\n` +
            `Guild Name: ${guild.name}\n` + 
            `Guild id: ${guild.id}\n` +
            `Guild creator: ${creatorStr}\n` +
            `Member count: ${guild.memberCount}`
    )
}

module.exports = guildCreate