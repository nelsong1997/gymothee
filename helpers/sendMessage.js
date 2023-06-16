//helpers
const sendDm = require('./sendDm.js')

//json
const userIds = require('../json/userIds.json')

async function sendMessage(channel, messageText, recursive) {
    // recursive == true => called from sendMessage

    //don't want to split messages into chunks of 2000 here because
    //we could end up breaking up formatting text like **

    channel.send(messageText).catch(error => handleError(error))

    async function handleError(error) {
        // we get an error while trying to send error message => give up
        if (recursive) {
            await sendDm(
                userIds.gabe,
                `Error occurred while trying to send message\n${JSON.stringify(error)}`
            )
            return
        }
        switch (error.code) {
            // length > 2000
            case 50035:
                await sendMessage(
                    channel,
                    "Error: Tried to send a message that was too long",
                    true
                )
                break;
            // no permission to send message
            case 50013:
                if (!channel.guild) {
                    console.log("unhandled exception, no permission to send dm")
                    return
                }
                await sendDm(
                    channel.guild.ownerId,
                    `Failed to send a message in channel: **${channel.name}** ` +
                    `in your server: **${channel.guild.name}** ` +
                    `due to lack of permissions`
                )
                break;
            // ????
            default:
                await sendMessage(
                    channel,
                    "Error: Failed to send message",
                    true
                )
        }
    }
}

module.exports = sendMessage