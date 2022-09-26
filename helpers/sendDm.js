//client
const client = require('../client.js')

//json
const userIds = require('../json/userIds.json')

async function sendDm(userId, message) {
    if (
        userId!==userIds.gabe &&
        (!client.user || client.user.id===userIds.gymotheeTest)
    ) {
        console.log(`intercepted dm while testing to ${userId}: ${message}`)
        return
    }
    let user = await client.users.fetch(userId)
    user.send(message)
    //if (userId!==userIds.gabe) sendDm(userIds.gabe, `sent to ${user.username}#${user.discriminator}: ${message}`)
}

module.exports = sendDm