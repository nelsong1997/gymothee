const client = require('../client.js')

//helpers
const get = require('./get.js')
const post = require('./post.js')
const sendDm = require('./sendDm.js')

//state
let state = {
    isReminding: false,
    enqueuedReminders: []
}

async function sendReminder(remindId, intentDate, late) {
    // console.log(`did enter sendReminder function ${new Date().toTimeString()}`)

    //handle multiple reminders running at the same time
    if (!state.isReminding) {
        state.isReminding = true
        // console.log("running " + remindId)
    } else {
        // console.log(`queueing ${remindId}`)
        state.enqueuedReminders.push({ id: remindId, date: intentDate })
        return
    }

    let reminds = await get('reminds')
    if (!reminds) {
        await onSendReminderEnd()
        return
    }

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
        await onSendReminderEnd()
        return
    }
    let remindDate = new Date(remind.date)
    if (remindDate - intentDate !== 0) {
        //this is when the date gets edited but the timeout is already set
        await onSendReminderEnd()
        return
    }
    
    let lateMsg = late ? " ... This reminder failed to send at the proper time. Sorry!" : ""
    if (remind.deliver==="dm") {
        for (let recipient of remind.whom) sendDm(recipient, remind.message + lateMsg)
    } else if (remind.deliver==="pub") {
        //first see if there is a cmd channel. if so use that one. otherwise use the channel in the obj
        let settings = await get('settings', remind.guildId)
        if (!settings) {
            // console.log(`failed to get settings for guild id ${remind.guildId} while reminding`)
            await onSendReminderEnd()
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
        //#weekdays
        //check for weekdays prop
        //get current dow
        //iterate thru array until found 1). day before or eq 2). day after
        //take diff between current day and the day found; add to current remind date
        //set remind date to the new date
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
                remindDate.setMonth(remindDate.getMonth() + freqNum)
                break;
            case "year":
                remindDate.setFullYear(remindDate.getFullYear() + freqNum)
        }
        remind.date = remindDate

        //in the rare case that the bot was offline and it sends a late reminder at midnight
        //and then it needs to send another one the same day
        //copied and modified from handlers/ready.js
        let now = new Date()
        let nextMidnight = new Date()
        nextMidnight.setDate(nextMidnight.getDate() + 1)
        nextMidnight.setHours(0, 0, 0, 0)
        let tillNextMidnight = nextMidnight - now
        let tillRemind = remindDate - now
        if (tillRemind < tillNextMidnight) {
            //remind occurs today; set timeout to send it
            setTimeout(() => sendReminder(remind.id, remindDate), tillRemind)
        }
    } else {
        // console.log(`sent reminders, now deleting remind with id ${remind.id}`)
        reminds = reminds.slice(0, index).concat(reminds.slice(index + 1))
    }

    await post('reminds', reminds)

    await onSendReminderEnd()
}

async function onSendReminderEnd() {
    state.isReminding = false

    if (state.enqueuedReminders.length) {
        //copy enqueued reminders
        let reminders = state.enqueuedReminders.slice(0)
        //delete all from queue
        state.enqueuedReminders = []
        for (let reminder of reminders) {
            //we can run all reminds that were in the queue in a loop async
            //since we can await each one
            await sendReminder(reminder.id, reminder.date)
        }
    }
}

module.exports = sendReminder