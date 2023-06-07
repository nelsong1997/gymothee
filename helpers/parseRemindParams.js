//helpers
const findUser = require('./findUser.js')
const checkDateWeekdayMatch = require('./checkDateWeekdayMatch.js')
const sendMessage = require('../helpers/sendMessage.js')

async function parseRemindParams(message, remind, keyValuePairs) {
    const validKeys = ["message", "whom", "date", "repeat", "deliver"]
    if (!keyValuePairs.length) {
        sendMessage(message.channel, "Error: no paramters specified")
        return
    }
    let changes = {}
    for (let keyValuePair of keyValuePairs) {
        if (!keyValuePair.includes("=")) {
            sendMessage(message.channel, `Error: Key value pair requires "=" between`)
            return
        }
        let kvpArr = keyValuePair.split("=")
        let key = kvpArr[0].toLowerCase()
        if (!validKeys.includes(key)) {
            sendMessage(message.channel, `Error: invalid key "${key}"`)
            return
        }
        let value = kvpArr[1]
        if (!value.startsWith('"') && value.endsWith('"')) {
            sendMessage(message.channel, `Error: The value specified for ${key} should be nested in quotes ("value").`)
            return
        }
        value = value.slice(1, value.length - 1).toLowerCase() //get rid of quotes

        if (changes[key]) {
            sendMessage(message.channel, `Error: you can't set the same key (${key}) twice with the same command`)
            return
        }
        switch (key) {
            case "repeat":
                //lowercasing is okay because it would only matter for messages
                value = value.toLowerCase()
                let valueArr = value.split(" ")
                if (value==="false") {
                    remind.repeat = false
                    changes.repeat = "disabled"
                } else if (valueArr[0]==="weekdays") {
                    const validWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                    let weekdaysInputStr = valueArr.slice(1).join(" ")
                    let weekdaysInputArr = weekdaysInputStr.split(",")
                    let weekdaysInputObj = {}
                    //validate input
                    //check for empty
                    if (weekdaysInputArr.length===0) {
                        sendMessage(message.channel, `Error: Please input at least one weekday`)
                        return
                    }
                    for (let i=0; i<weekdaysInputArr.length; i++) {
                        weekdaysInputArr[i] = weekdaysInputArr[i].trim()
                        //mon => Mon
                        weekdaysInputArr[i] = weekdaysInputArr[i].charAt(0).toUpperCase() + weekdaysInputArr[i].slice(1)
                        let day = weekdaysInputArr[i]
                        //check whether input is a real day
                        if (!validWeekdays.includes(day)) {
                            sendMessage(message.channel, 
                                `Error: ${day} is not a valid weekday. ` +
                                `Please use only the first three letters of each day and separate with commas.`
                            )
                            return
                        }
                        //check for duplicate
                        if (weekdaysInputObj[day]) {
                            sendMessage(message.channel, `Error: "${day}" was input more than once.`)
                            return
                        }
                        weekdaysInputObj[day] = true
                    }
                    //make sure remind date is one of the specified weekdays...if it exists
                    if (remind.date) {
                        let checkWeekdayResult = checkDateWeekdayMatch(remind.date, weekdaysInputArr)
                        if (checkWeekdayResult.error) {
                            sendMessage(message.channel, checkWeekdayResult.error)
                            return
                        }
                    }
                    //sort
                    weekdaysInputArr.sort((a, b) => validWeekdays.indexOf(a) - validWeekdays.indexOf(b))
                    //erase any possible irrelevant data
                    remind.repeat = {}
                    //populate reminder
                    remind.repeat.weekdays = weekdaysInputArr
                    //populate changes prop
                    changes.repeat = `Every ${weekdaysInputArr.join(", ")}`
                } else {
                    if (valueArr.length!==2) {
                        //should add weekday hint
                        sendMessage(message.channel, `Error: bad repeat value format. Try "<num> <timeUnit>" or "false" to disable`)
                        return
                    }
                    let num = Number(valueArr[0])
                    if (isNaN(num) || num%1 || num < 0) {
                        sendMessage(message.channel, "Error: invalid number for repeat")
                        return
                    }
                    let timeUnit = valueArr[1].toLowerCase()
                    const validTimeUnits = ["day", "week", "month", "year"]
                    if (!validTimeUnits.includes(timeUnit)) {
                        sendMessage(message.channel, `Error: "${timeUnit}" is not a valid time unit (${validTimeUnits.join(", ")})`)
                        return
                    }
                    if (!remind.repeat) remind.repeat = {}
                    remind.repeat.freqNum = num
                    remind.repeat.freqTimeUnit = timeUnit
                    changes.repeat = `Every ${num} ${timeUnit}${num > 1 ? "s" : ""}`
                }
                break;
            case "message":
                if (value.length > 200) {
                    sendMessage(message.channel, `Error: Message is too long (${value.length}/200 characters)`)
                    return
                }
                remind.message = value
                changes.message = value
                break;
            case "date":
                let newDate = new Date(value)
                let now = new Date()
                if (isNaN(newDate.getTime())) {
                    sendMessage(message.channel, 
                        `Error: Couldn't parse new date. Try using military time and this format: ` +
                        `HH:MM MM/DD/YY`
                    )
                    return
                } else if (newDate < now) {
                    sendMessage(message.channel, "Error: New date is in the past")
                    return
                }
                remind.date = newDate
                changes.date = newDate.toLocaleString('en-us')
                //make sure remind date is one of the specified weekdays...if it exists
                if (remind.repeat && remind.repeat.weekdays) {
                    let checkWeekdayResult = checkDateWeekdayMatch(remind.date, remind.repeat.weekdays)
                    if (checkWeekdayResult.error) {
                        sendMessage(message.channel, checkWeekdayResult.error)
                        return
                    }
                }
                break;
            case "whom":
                let usersArrIn = value.split(", ")
                let usersArrOut = []
                for (let username of usersArrIn) {
                    let user = await findUser(username)
                    if (!user) {
                        sendMessage(message.channel, `Couldn't find user "${username}"`)
                        return
                    }
                    usersArrOut.push(user.id)
                    if (!changes.whom) changes.whom = ""
                    changes.whom += `${user.username}#${user.discriminator}, `
                }
                changes.whom = changes.whom.slice(0, changes.whom.length - 2)
                remind.whom = usersArrOut
                break;
            case "deliver":
                if (value==="dm") {
                    remind.deliver = "dm"
                    changes.deliver = "DM"
                } else if (value==="pub") {
                    if (!message.guild) {
                        sendMessage(message.channel, 
                            "Error: To set a reminder to public delivery you must post your command in a public channel"
                        )
                        return
                    }
                    remind.deliver = "pub"
                    remind.channelId = message.channel.id
                    remind.guildId = message.guild.id
                    changes.deliver = "public"
                } else {
                    sendMessage(message.channel, `Error: Please set "deliver" to "pub" or "dm"`)
                    return
                }
        }
    }
    if (!remind.date) {
        sendMessage(message.channel, 
            "Error: The reminder must include a date."
        )
        return
    }
    return { remind: remind, changes: changes }
}

module.exports = parseRemindParams