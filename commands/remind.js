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

    if (!params.length) {
        message.channel.send(
            `Error: Parameters for your reminder are required. ` +
            `Try using "on", "at", "in", "after", or "custom".`
        )
        return
    }

    // 6/21/22
    // remind should now be one of three types
    // "on/at" -> specify a date for the remind to occur
    // "after/in" -> remind after a duration
    // custom -> specify parameters of reminder manually

    let whomStr = ""
    let remindTypeStr = params[0].toLowerCase()

    if (remindTypeStr==="on" || remindTypeStr==="at") {
        let whenArr = params.slice(1,3)

        let result = parseDate(whenArr)
        if (result.error) {
            message.channel.send(result.error)
            return
        }
        newRemind.date = result.date
        //str that contains message and mentions
        let remainderStr = params.slice(result.dateSpecParams + 1).join(" ")

        let result2 = await parseMsgAndRecips(remainderStr, message)
        newRemind.message = result2.message
        newRemind.whom = result2.whom
        whomStr = result2.whomStr
    } else if (remindTypeStr==="after" || remindTypeStr==="in") {
        let remindParamsStr = params.slice(1).join(" ")
        let result = parseDuration(remindParamsStr)
        if (result.error) {
            message.channel.send(result.error)
            return
        }
        newRemind.date = result.date

        let result2 = await parseMsgAndRecips(result.remainderStr, message)
        whomStr = result2.whomStr
        newRemind.message = result2.message
        newRemind.whom = result2.whom
    } else if (remindTypeStr==="custom") {
        let keyValuePairs = params.slice(1).join(" ").split("; ")
        let result = await parseRemindParams(message, newRemind, keyValuePairs)
        if (!result) return //errors should be sent from the func above
        newRemind = result.remind
        whomStr = result.changes.whom || message.author.username + "#" + message.author.discriminator
    } else {
        message.channel.send("Failed to parse your reminder command.")
        return
    }

    //date validation
    if (!newRemind.date.getTime()) {
        message.channel.send("Error: Invalid date/time.")
        return
    }

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
        if (newRemind.repeat) {
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
}

function parseDate(arr) {
    let dateStr = ""
    let timeStr = ""
    let rightNow = new Date()
    let dateSpecParams = 2 // how many params are used to specify date/time
    switch (strIsTimeOrDate(arr[0])) {
        case "date":
            dateStr = arr[0]
            break;
        case "time": timeStr = arr[0]
            break;
        case undefined: 
            return { error: `Error: ${arr[0]} is not a valid date or time.`}
    }
    switch (strIsTimeOrDate(arr[1])) {
        case "date": 
            if (dateStr!=="") {
                return { error: `Error: Invalid date/time.`}
            } else {
                dateStr = arr[1]
            }
            break;
        case "time": 
            if (timeStr!=="") {
                return { error: `Error: Invalid date/time.`}
            } else {
                timeStr = arr[1]
            }
            break;
        case undefined:
            dateSpecParams = 1
            if (dateStr==="") { //assume it's today
                dateStr = `${rightNow.getMonth() + 1}/${rightNow.getDate()}/${rightNow.getFullYear()}`
            } else { //assume midnight on date specified
                timeStr = "00:00"
            }
    }

    //handle am/pm
    let endOfTimeStr = timeStr.slice(timeStr.length - 2, timeStr.length).toLowerCase()
    
    let timeStrArr = timeStr.split(":")
    let hours = Number(timeStrArr[0])
    if (endOfTimeStr==="am" && hours===12) timeStr = "00:" + timeStrArr.slice(1).join(":")
    else if (endOfTimeStr==="pm") {
        if (hours!==12) hours += 12
        timeStr = hours + ":" + timeStrArr.slice(1).join(":")
    }
    if (endOfTimeStr==="am" || endOfTimeStr==="pm") timeStr = timeStr.slice(0, timeStr.length - 2)
    
    let finalDate = new Date(`${dateStr} ${timeStr}`)
    let timeStrHours = Number(timeStr.split(":")[0])
    if (rightNow > finalDate && timeStrHours < 12) {
        //no am/pm specified but finalDate is in the past
        //we assumed am but should be pm
        finalDate.setHours(finalDate.getHours() + 12)
        if (rightNow > finalDate) {
            //revert if it didn't fix the problem
            finalDate.setHours(finalDate.getHours() - 12)
        }
    }

    return {
        date: finalDate,
        dateSpecParams: dateSpecParams
    }
}

function parseDuration(str) {
    //30s, 3min, 1hr, 1d, 1w, 1m, 1yr
    //1:00:00
    let duration = {}
    let remainderStr = ""
    const timeInputs = {
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
    const timeUnits = [
        "Seconds",
        "Minutes",
        "Hours",
        "Date",
        "Month",
        "FullYear"
    ]

    if (str.includes(":")) {
        //2:45:32 message @joey#1234
        let spaceIndex = str.search(" ")
        let durationStr = str.slice(0, spaceIndex)
        remainderStr = str.slice(spaceIndex + 1, str.length)
        let timeArray = durationStr.split(":").reverse()
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
        //1min, 30sec message @joey#1234
        let specs = str.toLowerCase().split(", ")
        for (let i=0; i<specs.length; i++) {
            let spec = specs[i]
            let wordsArr = spec.split(" ")
            //1min
            let specResult1 = testDurationSpec(wordsArr[0])
            let specResult2;
            if (specResult1.error) {
                //1 min
                specResult2 = testDurationSpec(wordsArr[0] + wordsArr[1])
                //could throw both errors?
                if (specResult2.error) return { error: specResult1.error }
                else {
                    remainderStr = wordsArr.slice(2).join(" ")
                    duration[specResult2.timeUnit] = specResult2.durNum
                    //if the spec still has more stuff in it but didn't error
                    //that's the start of the message and the message simply has a comma
                    if (`${wordsArr[0]} ${wordsArr[1]}`!==spec) {
                        //!remind in 30 s thing1, thing2
                        //`${wordsArr[0]} ${wordsArr[1]}`==="30 s"
                        //spec==="30 s thing1"
                        //wordsArr.slice(2).join(" ")==="thing1"
                        //`, ${specs.slice(i).join(", ")}`===", thing2"
                        if (specs[i+1]) remainderStr += `, ${specs.slice(i+1).join(", ")}`
                        //remainderStr==="thing1, thing2"
                        break;
                    }
                }
            } else {
                remainderStr = wordsArr.slice(1).join(" ")
                duration[specResult1.timeUnit] = specResult1.durNum
                //if spec1 didnt error on its own AND has more stuff in it
                //that's the start of the message and the message simply has a comma
                if (wordsArr[0]!==spec) {
                    //!remind in 30s thing1, thing2
                    //wordsArr[0]==="30s"
                    //spec==="30s thing1"
                    //wordsArr.slice(1).join(" ")==="thing1"
                    //`, ${specs.slice(i).join(", ")}`===", thing2"
                    if (specs[i+1]) remainderStr += `, ${specs.slice(i+1).join(", ")}`
                    //remainderStr==="thing1, thing2"
                    break;
                }
            }

            function testDurationSpec(specStr) {
                //test the spec str to see if it is a duration spec or not
                let textPart = specStr.replaceAll(/\d| /g, '')
                let numStr = specStr.replaceAll(/\D/g, '')
                let num = Number(numStr)

                if (specStr !== numStr + textPart) {
                    //weed out weird formats like the text coming first
                    //or text and numbers interspersed
                    return { error: `Error: Specification "${specStr}" is improperly formatted` }
                }

                if ( //handle plurals; "secs" "mins" etc are valid
                    textPart.slice(textPart.length - 1) === "s" &&
                    timeInputs[`${textPart.slice(0, textPart.length - 1)}`]
                ) {
                    textPart = textPart.slice(0, textPart.length - 1)
                }
                
                if (!timeInputs[`${textPart}`]) {
                    return { error: `"${textPart}" is not a recognized time unit.` }
                } else if (isNaN(num)) {
                    return { error: `${numStr} for unit "${textPart}" is not a number`} 
                } else if (num < 0) {
                    return { error: `Error: Time specified for time unit "${textPart}" cannot be negative.` }
                } else if (num%1 > 0) {
                    return { error: `Error: Time specified for time unit "${textPart}" must be an integer.` }
                } else if (duration[timeInputs[`${textPart}`]]) {
                    return { error: `Error: Time specified for time unit "${textPart}" more than once.` }
                }
                return { timeUnit: timeInputs[`${textPart}`], durNum: num }
            }
        }
    }

    let reminderDate = new Date()

    for (let timeUnit in duration) {
        //ex timeUnit = Seconds => date.setSeconds(date.getSeconds() + duration.Seconds)
        reminderDate["set" + timeUnit](reminderDate["get" + timeUnit]() + duration[timeUnit])
    }

    return { 
        date: reminderDate,
        remainderStr: remainderStr
    }
}

async function parseMsgAndRecips(str, message) {
    //need to find where mentions/pseudo mentions are, if they exist
    let trueIndexOfAtSymbol = 0 //index within str
    let fakeIndexOfAtSymbol = 0 //index within remainingMsg
    let remainingMsg = str
    let msgNoRecips = str
    let recips = ""
    let whomStr = ""

    if (message.mentions.users.size > 0) {
        msgNoRecips = str.slice(0, str.search("<@"))
    } else {
        while (trueIndexOfAtSymbol < str.length) {
            fakeIndexOfAtSymbol = remainingMsg.search("@")
            if (fakeIndexOfAtSymbol===-1) break; //@ not found
            trueIndexOfAtSymbol += fakeIndexOfAtSymbol
            remainingMsg = remainingMsg.slice(fakeIndexOfAtSymbol)
            if (remainingMsg[1]!==" ") {
                msgNoRecips = str.slice(0, trueIndexOfAtSymbol)
                recips = str.slice(trueIndexOfAtSymbol)
                break;
            }
            remainingMsg = remainingMsg.slice(1)
        }
    }

    //find whom to send the reminder to
    let whomUsernamesArr = []
    let whomUserIds = [message.author.id]
    //if there are mentions, just worry about those

    if (message.mentions.users.size > 0) {
        whomUserIds = []
        for (let [key, user] of message.mentions.users) {
            whomUserIds.push(user.id)
            whomUsernamesArr.push(user.username + "#" + user.discriminator)
        }
        whomStr = whomUsernamesArr.join(", ")
    } else if (recips) {
        whomUserIds = []
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
            whomUserIds.push(theUser.id)
            whomUsernamesArr.push(theUser.username + "#" + theUser.discriminator)
        }
        whomStr = whomUsernamesArr.join(", ")
    } else {
        whomStr = message.author.username + "#" + message.author.discriminator
        //newRemind.whom initializes as just the author
    }

    return {
        message: msgNoRecips.trim() || "Reminder!",
        whomStr: whomStr,
        whom: whomUserIds
    }
}

function strIsTimeOrDate(str) {
    if (!str) return
    if (str.includes("/")) {
        let dateRegex = /^[1-12]|0[1-9]\/[1-31]|0[1-9]\/20[22-99]|[22-99]$/
        if (!dateRegex.test(str)) return
        return "date"
    } else if (str.includes(":")) {
        let timeRegex = /^([0-9]|0[1-9]|1[0-9]|2[0-3]):[0-5][0-9](|:[0-5][0-9])(am|pm|$)$/i
        if (!timeRegex.test(str)) return
        let hours = Number(str.split(":")[0])
        let endOfTimeStr = str.slice(str.length - 2, str.length).toLowerCase()
        if (hours > 12 && (endOfTimeStr==="am" || endOfTimeStr==="pm")) return
        return "time"
    }
}

module.exports = remind

// 7/5/22
//maybe would like to remind at 11am
//maybe should send the reminder id as its own message for easy copying on mobile
//would maybe like to freeform repeats

// 9/14/22
//for better logging, have a cancel prop on reminds; delete upon trigger to
//    better differentiate between failures and deletes
//