//helpers
const createReminder = require('../helpers/createReminder.js')
const parseRemindParams = require('../helpers/parseRemindParams.js')
const sendDm = require('../helpers/sendDm.js')
const findUser = require('../helpers/findUser.js')

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

    // 6/21/22
    // remind should now be one of three types
    // "on/at" -> specify a date for the remind to occur
    // "after/in" -> remind after a duration
    // custom -> specify parameters of reminder manually

    let whomStr = ""
    let remindTypeStr = params[0].toLowerCase()
    let dateSpecParams = 2 // how many params are used to specify date/time
    if (remindTypeStr==="on" || remindTypeStr==="at") {
        let whenArr = params.slice(1,3)
        let dateStr = ""
        let timeStr = ""
        switch (strIsTimeOrDate(whenArr[0])) {
            case "date":
                dateStr = whenArr[0]
                break;
            case "time": timeStr = whenArr[0]
                break;
            case undefined: 
                message.channel.send(`Error: ${whenArr[0]} is not a valid date or time.`)
                return
        }
        switch (strIsTimeOrDate(whenArr[1])) {
            case "date": 
                if (dateStr!=="") {
                    message.channel.send(`Error: Invalid date/time.`)
                    return
                } else {
                    dateStr = whenArr[1]
                }
                break;
            case "time": 
                if (timeStr!=="") {
                    message.channel.send(`Error: Invalid date/time.`)
                    return
                } else {
                    timeStr = whenArr[1]
                }
                break;
            case undefined:
                dateSpecParams = 1
                let rightNow = new Date()
                if (dateStr==="") { //assume it's today
                    dateStr = `${rightNow.getMonth() + 1}/${rightNow.getDate()}/${rightNow.getFullYear()}`
                } else { //assume midnight on date specified
                    timeStr = "00:00"
                }
        }

        //handle am/pm
        let endOfTimeStr = timeStr.slice(timeStr.length - 2, timeStr.length).toLowerCase()
        if (endOfTimeStr==="am") timeStr = timeStr.slice(0, timeStr.length - 2)
        else if (endOfTimeStr==="pm") {
            let timeStrArr = timeStr.split(":")
            let hours = Number(timeStrArr[0]) + 12
            timeStr = hours + ":" + timeStrArr.slice(1).join(":")
            timeStr = timeStr.slice(0, timeStr.length - 2)
        }

        //Make sure we have a real date
        newRemind.date = new Date(dateStr + " " + timeStr)
        if (!newRemind.date.getTime()) {
            message.channel.send("Error: Invalid date/time.")
            return
        }

        //need to find where mentions/pseudo mentions are, if they exist
        let msgAndRecips = params.slice(dateSpecParams + 1).join(" ")
        let trueIndexOfAtSymbol = 0 //index within msgAndRecips
        let fakeIndexOfAtSymbol = 0 //index within remainingMsg
        let remainingMsg = msgAndRecips
        let msgNoRecips = msgAndRecips
        let recips = ""
        if (message.mentions.users.size > 0) {
            trueIndexOfAtSymbol = msgAndRecips.search("<@")
            msgNoRecips = msgAndRecips.slice(0, trueIndexOfAtSymbol)
        } else {
            while (trueIndexOfAtSymbol < msgAndRecips.length) {
                fakeIndexOfAtSymbol = remainingMsg.search("@")
                if (fakeIndexOfAtSymbol===-1) break; //@ not found
                trueIndexOfAtSymbol += fakeIndexOfAtSymbol
                remainingMsg = remainingMsg.slice(fakeIndexOfAtSymbol)
                if (remainingMsg[1]!==" ") {
                    msgNoRecips = msgAndRecips.slice(0, trueIndexOfAtSymbol)
                    recips = msgAndRecips.slice(trueIndexOfAtSymbol)
                    break;
                }
                remainingMsg = remainingMsg.slice(1)
            }
        }
        newRemind.message = msgNoRecips.trim()

        //find whom to send the reminder to
        let whomUsernamesArr = []
        //if there are mentions, just worry about those

        if (message.mentions.users.size > 0) {
            newRemind.whom = []
            for (let [key, user] of message.mentions.users) {
                newRemind.whom.push(user.id)
                whomUsernamesArr.push(user.username + "#" + user.discriminator)
            }
            whomStr = whomUsernamesArr.join(", ")
        } else if (recips) {
            newRemind.whom = []
            let recipUsersArr = recips.split(", ")
            //for now only handle id or name#discriminator
            for (let user of recipUsersArr) {
                if (!user.startsWith("@")) {
                    message.channel.send("Error: couldn't parse recipients")
                    return
                }
                let theUser = await findUser(user.slice(1))
                if (!theUser) {
                    message.channel.send(`Error: couldn't find user for recipient: "${user}"`)
                    return
                }
                newRemind.whom.push(theUser.id)
                whomUsernamesArr.push(theUser.username + "#" + theUser.discriminator)
            }
            whomStr = whomUsernamesArr.join(", ")
        } else {
            whomStr = message.author.username + "#" + message.author.discriminator
            //newRemind.whom initializes as just the author
        }
    } else if (remindTypeStr==="after" || remindTypeStr==="in") {
        return
        //use parseduration
    } else if (remindTypeStr==="custom") {
        let keyValuePairs = params.slice(1).join(" ").split("; ")
        let result = await parseRemindParams(message, newRemind, keyValuePairs)
        if (!result) return //errors should be sent from the func above
        newRemind = result.remind
        whomStr = result.changes.whom || message.author.username + "#" + message.author.discriminator
    }

    // if (params.length===1) {
    //     //basic command / !remind 30s
    //     //reminds after specified duration
    //     let remindDate = parseDuration(params[0])
    //     if (remindDate.error) {
    //         message.channel.send(remindDate.error)
    //         return
    //     } else {
    //         newRemind.date = remindDate
    //         whomStr = message.author.username + "#" + message.author.discriminator
    //     }
    // } else {
    //     message.channel.send("Failed to parse your reminder command.")
    //     return
    // }

    let result = await createReminder(newRemind)
    if (result && result.error) {
        message.channel.send(result.error)
        return
    } else if (result) {
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
                `with message: "${newRemind.message}". ` +
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
    const timeUnits = {
        //link possible time unit inputs to date funcs
        "s": "Seconds",
        "sec": "Seconds",
        "second": "Seconds",
        "min": "Minutes",
        "minute": "Minutes",
        "h": "Hours",
        "hr": "Hours",
        "hour": "Hours",
        "d": "Date",
        "day": "Date",
        "mon": "Month",
        "month": "Month",
        "y": "FullYear",
        "yr": "FullYear",
        "year": "FullYear"
    }
    if (str.includes(":")) {
        let timeArray = str.split(":").reverse()
        if (timeArray.length > 6) {
            return { 
                error:
                    `Error: Too many time units in duration. ` +
                    `The smallest readable time unit is ` + 
                    `seconds and the largest is years.`
            }
        }
        for (let i=0; i<timeArray.length; i++) {
            let durationNum = Number(timeArray[i])
            if (isNaN(durationNum)) {
                return {
                    error: 
                        `Error: Time specified for time unit ` +
                        `"${timeUnits[i]}" is not a number.`
                }
            } else if (durationNum < 0) {
                return {
                    error: 
                        `Error: Time specified for time unit ` +
                        `"${timeUnits[i]}" cannot be negative.`
                }
            } else if (durationNum%1 > 0) {
                return {
                    error: 
                        `Error: Time specified for time unit ` +
                        `"${timeUnits[i]}" must be an integer.`
                }
            }
            duration[timeUnits[i]] = durationNum
        }
    } else {
        let specs = str.split(", ")
        for (let spec of specs) {
            let textPart = spec.replaceAll(/\d/g, '')
            let numStr = spec.replaceAll(/\D/g, '')
            let num = Number(numStr)
            if (!timeUnits[`${textPart}`]) {
                return { error: `"${textPart}" is not a recognized time unit.` }
            } else if (spec !== numStr + textPart) {
                return { error: `specification for "${textPart}" is improperly formatted` }
            } else if (isNaN(num)) {
                return { error: `${numStr} for unit "${textPart}" is not a number`}
            } else if (num < 0) {
                return {
                    error: 
                        `Error: Time specified for time unit ` +
                        `"${textPart}" cannot be negative.`
                }
            } else if (num%1 > 0) {
                return {
                    error: 
                        `Error: Time specified for time unit ` +
                        `"${textPart}" must be an integer.`
                }
            } else if (duration[timeUnits[`${textPart}`]]) {
                return {
                    error: 
                        `Error: Time specified for time unit ` +
                        `"${textPart}" more than once.`
                }
            }
            duration[timeUnits[`${textPart}`]] = num
        }
    }
    let remind = new Date()
    for (let timeUnit in duration) {
        remind["set" + timeUnit](remind["get" + timeUnit] + duration[timeUnit])
    } 
    return remind
}

function strIsTimeOrDate(str) {
    if (!str) return
    if (str.includes("/")) {
        let dateRegex = /[1-12]|0[1-9]\/[1-31]|0[1-9]\/20[22-99]|[22-99]/
        if (!dateRegex.test(str)) return
        return "date"
    } else if (str.includes(":")) {
        let timeRegex = /0[1-9]|0-23:0[1-9]|[10-59]$|:0[1-9]|:[10-59]$|(( |$)(am|pm))/i
        if (timeRegex.test(str)) return
        let hours = Number(str.split(":")[0])
        let endOfTimeStr = str.slice(str.length - 2, str.length).toLowerCase()
        if (hours > 12 && (endOfTimeStr==="am" || endOfTimeStr==="pm")) return
        return "time"
    }
}

module.exports = remind