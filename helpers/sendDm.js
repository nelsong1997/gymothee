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

    let user = await client.users.fetch(userId).catch(
        error => console.log(`Error sending DM: ${error}`)
    )
    
    user.send(message).catch(
        error => console.log(`Found user but failed to DM: ${userId}`)
    )
    //if (userId!==userIds.gabe) sendDm(userIds.gabe, `sent to ${user.username}: ${message}`)
}

module.exports = sendDm