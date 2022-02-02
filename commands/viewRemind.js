const client = require('../client.js')

//helpers
const get = require('../helpers/get.js')

async function viewRemind(params, message) {
    let remindId = params[0]
    let reminds = await get('reminds')
    if (!reminds) return

    if (remindId==="all") {
        let authorId = message.author.id
        sendThis = "Here are reminders that will be sent to you or that you have created:\n"
        idArray = []
        let count = 0
        for (let remind of reminds) {
            if (remind.creator===authorId || remind.whom.includes(authorId)) {
                sendThis += (await formatRemind(remind, 1) + "\n")
                idArray.push(remind.id)
                count++
            }
        }
        if (count===0) {
            message.channel.send("There are currently no reminders that you have created or that will be sent to you.")
        } else if (sendThis.length > 2000) {
            message.channel.send(
                "Here are reminders that will be sent to you or that you have created: " +
                idArray.join(", ")
            )
        } else message.channel.send(sendThis)
        return
    }

    let index = null
    for (let i=0; i<reminds.length; i++) {
        if (remindId===reminds[i].id) {
            index = i
            break;
        }
    }
    let theRemind = reminds[index]
    let authorId = message.author.id
    if (index===null) {
        message.channel.send(`Failed to find reminder with id: ${remindId}`)
        return
    } else if (authorId===theRemind.creator) {
        message.channel.send(await formatRemind(theRemind))
    } else if (theRemind.whom.includes(authorId)) {
        message.channel.send(await formatRemind(theRemind))
    } else {
        message.channel.send(
            `You cannot view reminder with id: ${remindId} since you are ` +
            `not the creator of nor are you included in this reminder.`
        )
    }
    async function formatRemind(remindObj) {
        let whomArr = []
        for (let userId of remindObj.whom) {
            try {
                let user = await client.users.fetch(userId)
                whomArr.push(user.username + "#" + user.discriminator)
            } catch (err) {
                console.log("failed to find user with id " + userId)
                whomArr.push("Unknown user")
            }
        }
        let delivery = ""
        if (remindObj.deliver==="dm") delivery = "DM"
        else if (remindObj.deliver==="pub") {
            let guildSettings = await get("settings", remindObj.guildId)
            let theChannelId = guildSettings.commandChannelId ? guildSettings.commandChannelId : remindObj.channelId
            try {
                let theChannel = await client.channels.fetch(theChannelId)
                delivery = `Public, in: #${theChannel.name}`
            } catch (err) {
                delivery = "unknown?"
            }
            
        }
        let repeatValue = remindObj.repeat
        let repeatStr = "None"
        if (repeatValue) repeatStr = `Every ${repeatValue.freqNum} ${repeatValue.freqTimeUnit}${repeatValue.freqNum > 1 ? "s" : ""}`
        return (
            `**ID:** ${remindObj.id}\n` +
            `    **Date:** ${new Date(remindObj.date).toLocaleString('en-US')}\n` +
            `    **Message:** ${remindObj.message}\n` +
            `    **Whom:** ${whomArr.join(", ")}\n` +
            `    **Delivery:** ${delivery}\n` +
            `    **Repeat:** ${repeatStr}`
        )
    }
}

module.exports = viewRemind