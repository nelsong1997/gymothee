const userIds = require('../json/userIds.json')
const client = require('../client.js')
const sendDm = require('../helpers/sendDm')

async function say (params, message) {
    if (message.guild===null && message.author.id===userIds.gabe) {
        let channelString = params[0]
        let speech = params.slice(1).join(" ")
        try {
            let channel = await client.channels.fetch(channelString)
            channel.send(speech)
        } catch (error) {
            sendDm(userIds.gabe, "bad channel id")
        }
    }
}

module.exports = say