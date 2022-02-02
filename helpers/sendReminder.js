const client = require('../client.js')

//helpers
const get = require('./get.js')
const post = require('./post.js')
const sendDm = require('./sendDm.js')

async function sendReminder(remindId, late) {
    console.log(`did enter sendReminder function ${new Date().toTimeString()}`)
    let reminds = await get('reminds')
    if (!reminds) return

    let index = null //if the remind got cancelled we shouldn't be able to find matching id
    let remind = null
    for (let i=0; i<reminds.length; i++)  {
        if (reminds[i].id===remindId) {
            index = i
            remind = reminds[i]
            break;
        }
    }
    if (!remind) {
        console.log(`failed to find remind with id: ${remindId}`)
        return
    }
    
    let lateMsg = late ? " ... This reminder failed to send at the proper time. Sorry!" : ""
    if (remind.deliver==="dm") {
        for (let recipient of remind.whom) sendDm(recipient, remind.message + lateMsg)
    } else if (remind.deliver==="pub") {
        //first see if there is a cmd channel. if so use that one. otherwise use the channel in the obj
        let settings = await get('settings', remind.guildId)
        if (!settings) {
            console.log(`failed to get settings for guild id ${remind.guildId} while reminding`)
            return
        }
        let channelId = settings.commandChannelId ? settings.commandChannelId : remind.channelId
        try {
            let theChannel = await client.channels.fetch(channelId)
            theChannel.send(`${remind.message}${lateMsg} <@${remind.whom.join("> <@")}>`)
        } catch (error) {
            console.log("couldn't find channel (to send reminder) with id: ", channelId)
            sendDm(
                remind.creator,
                `Failed to send reminder with id: ${remind.id}. ` +
                `There was a problem finding the channel in which to send the reminder (id: ${channelId}).`
            )
        }
    }
    if (remind.repeat) {
        let remindDate = new Date(remind.date)
        let freqNum = remind.repeat.freqNum
        // {
        //     freqTimeUnit: "day",
        //     freqNum: 1,
        //     weekdays: null,
        //     dayOfMonth: null
        // }
        switch (remind.repeat.freqTimeUnit) {
            case "day":
                remindDate.setDate(remindDate.getDate() + freqNum)
                break;
            case "week":
                remindDate.setDate(remindDate.getDate() + 7 * freqNum)
                break;
            case "month":
                remindDate.setMonth(remindDate.getMonth + freqNum)
                break;
            case "year":
                remindDate.setFullYear(remindDate.getFullYear() + freqNum)
        }
        remind.date = remindDate
        console.log(`sent reminders, now setting new remind based on repeat for date: ${remindDate.toLocaleString('en-us')}`)
    } else {
        console.log(`sent reminders, now deleting remind with id ${remind.id}`)
        reminds = reminds.slice(0, index).concat(reminds.slice(index + 1))
    }

    await post('reminds', reminds)
}

module.exports = sendReminder