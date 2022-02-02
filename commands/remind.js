//helpers
const createReminder = require('../helpers/createReminder.js')
const parseRemindParams = require('../helpers/parseRemindParams.js')
const sendDm = require('../helpers/sendDm.js')

async function remind(params, message) {
    let remindId = '_' + Math.random().toString(36).slice(2, 11); //gen unique id for remind
    
    let newRemind = {
        message: "Reminder!",
        channelId: message.channel.id,
        guildId: message.guild ? message.guild.id : null,
        deliver: message.guild ? "pub" : "dm",
        creator: message.author.id,
        whom: [message.author.id],
        id: remindId,
        repeat: false
    }

    let dateStr = params.join(" ")
    let maybeDate = new Date(dateStr)
    let whomStr = ""
    if (message.content.includes("=")) {
        let keyValuePairs = params.join(" ").split("; ")
        let result = await parseRemindParams(message, newRemind, keyValuePairs)
        if (!result) return
        newRemind = result.remind
        whomStr = result.changes.whom || message.author.username + "#" + message.author.discriminator
    } else if (!isNaN(maybeDate.getTime())) { 
        //maybeDate is a valid date
        //reminder should fire on this date
        //really need to update this because a lot of unintended stuff can get parsed as a date.
        //probably should only accept mm/dd/yy or mm/dd/yy hh:mm
        newRemind.date = maybeDate
        whomStr = message.author.username + "#" + message.author.discriminator
    } else if (params.length===1) {
        //basic command / !remind 30s
        //reminds after specified duration
        let remindDate = parseDuration(params[0])
        if (remindDate.error) {
            message.channel.send(remindDate.error)
            return
        } else {
            newRemind.date = remindDate
            whomStr = message.author.username + "#" + message.author.discriminator
        }
    } else {
        message.channel.send("Failed to parse your reminder command.")
        return
    }

    let result = await createReminder(newRemind)
    if (result && result.error) message.channel.send(result.error)
    else if (result) {
        message.channel.send(
            `Reminder with id: ${remindId} created. This reminder will fire on ` +
            `${newRemind.date.toLocaleString('en-us')}` +
            (newRemind.repeat ? `, repeating every ${newRemind.repeat.freqNum} ${newRemind.repeat.freqTimeUnit}` : ``) +
            ((newRemind.repeat && newRemind.repeat.freqNum > 1) ? "s" : "") +
            `. User(s): ${whomStr} ` +
            `will be notified via ${newRemind.deliver==="dm" ? "DM" : "this text channel"}.`
        )
        for (let userId of newRemind.whom) {
            if (userId===message.author.id) continue;
            sendDm(
                userId,
                `Reminder with id: ${remindId} was created by user: ` +
                `${message.author.username}#${message.author.discriminator} ` +
                `with message: "${newRemind.message}".`
                `This reminder will fire on ` +
                `${newRemind.date.toLocaleString('en-us')}` +
                (newRemind.repeat ? `, repeating every ${newRemind.repeat.freqNum} ${newRemind.repeat.freqTimeUnit}` : ``) +
                ((newRemind.repeat && newRemind.repeat.freqNum > 1) ? "s" : "") +
                `. User(s): ${whomStr} ` +
                `will be notified via ${newRemind.deliver==="dm" ? "DM" : "this text channel"}.`
            )
        }
    }
}

function parseDuration(str) {
    //30s, 3min, 1hr, 1d, 1w, 1m, 1yr
    //1:00:00
    let duration = {}
    const timeUnits = [
        "sec",
        "min",
        "hrs",
        "day",
        "mon",
        "yrs"
    ]
    if (str.includes(":")) {
        let timeArray = str.split(":").reverse()
        for (let i=0; i<timeArray.length; i++) {
            let durationNum = Number(timeArray[i])
            if (i===6) {
                return { 
                    error:
                        `Error: Too many time units in duration. ` +
                        `The smallest readable time unit is ` + 
                        `seconds and the largest is years.`
                }
            } else if (isNaN(durationNum)) {
                return {
                    error: 
                        `Error: Time specified for time unit ` +
                        `"${timeUnits[i]}" is not a number.`
                }
            }
            duration[timeUnits[i]] = durationNum
        }
    } else {
        let specs = str.split(",")
        for (let spec of specs) {
            let textPart = spec.replaceAll(/\d/g, '')
            let numStr = spec.replaceAll(/\D/g, '')
            let num = Number(numStr)
            if (!timeUnits.includes(textPart)) {
                return { error: `"${textPart}" is not a recognized time unit. Please use: ${timeUnits.join(", ")}` }
            } else if (spec !== numStr + textPart) {
                return { error: `specification for "${textPart}" is improperly formatted` }
            } else if (isNaN(num)) {
                return { error: `${numStr} for unit "${textPart}" is not a number`}
            }
            duration[textPart] = num
        }
    }
    for (let unit of timeUnits) if (!duration[unit]) duration[unit] = 0
    let remind = new Date()
    remind.setSeconds(remind.getSeconds() + duration.sec)
    remind.setMinutes(remind.getMinutes() + duration.min)
    remind.setHours(remind.getHours() + duration.hrs)
    remind.setDate(remind.getDate() + duration.day)
    remind.setMonth(remind.getMonth() + duration.mon)
    remind.setFullYear(remind.getFullYear() + duration.yrs)
    return remind
}

module.exports = remind