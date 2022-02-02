const findUser = require('./findUser.js')

async function parseRemindParams(message, remind, keyValuePairs) {
    const validKeys = ["message", "whom", "date", "repeat", "deliver"]
    if (!keyValuePairs.length) {
        message.channel.send("Error: no edits specified")
        return
    }
    let changes = {}
    for (let keyValuePair of keyValuePairs) {
        if (!keyValuePair.includes("=")) {
            message.channel.send(`Error: Key value pair requires "=" between`)
            return
        }
        let kvpArr = keyValuePair.split("=")
        let key = kvpArr[0].toLowerCase()
        if (!validKeys.includes(key)) {
            message.channel.send(`Error: invalid key "${key}"`)
            return
        }
        let value = kvpArr[1]
        if (!value.startsWith('"') && value.endsWith('"')) {
            message.channel.send(`Error: The value specified for ${key} should be nested in quotes ("value").`)
        }
        value = value.slice(1, value.length - 1).toLowerCase() //get rid of quotes

        if (changes[key]) {
            message.channel.send(`Error: you can't set the same key (${key}) twice with the same command`)
            return
        }
        switch (key) {
            case "repeat":
                if (value==="false") {
                    remind.repeat = false
                    changes.repeat = "disabled"
                } else {
                    let valueArr = value.split(" ")
                    if (valueArr.length!==2) {
                        message.channel.send(`Error: bad repeat value format. Try "<num> <timeUnit>" or "false" to disable`)
                    }
                    let num = Number(valueArr[0])
                    if (isNaN(num) || num%1 || num < 0) {
                        message.channel.send("Error: invalid number for repeat")
                        return
                    }
                    let timeUnit = valueArr[1].toLowerCase()
                    const validTimeUnits = ["day", "week", "month", "year"]
                    if (!validTimeUnits.includes(timeUnit)) {
                        message.channel.send(`Error: "${timeUnit}" is not a valid time unit (${validTimeUnits.join(", ")})`)
                        return
                    }
                    if (!remind.repeat) remind.repeat = {}
                    remind.repeat.freqNum = num
                    remind.repeat.freqTimeUnit = timeUnit
                    changes.repeat = `every ${num} ${timeUnit}${num > 1 ? "s" : ""}`
                }
                break;
            case "message":
                if (value.length > 200) {
                    message.channel.send("Error: new message is too long")
                    return
                }
                remind.message = value
                changes.message = value
                break;
            case "date":
                let newDate = new Date(value)
                let now = new Date()
                if (isNaN(newDate.getTime())) {
                    message.channel.send(
                        `Error: Couldn't parse new date. Try using military time and this format: ` +
                        `HH:MM MM/DD/YY`
                    )
                    return
                } else if (newDate < now) {
                    message.channel.send("Error: New date is in the past")
                    return
                }
                remind.date = newDate
                changes.date = newDate.toLocaleString('en-us')
                break;
            case "whom":
                let usersArrIn = value.split(", ")
                let usersArrOut = []
                for (let username of usersArrIn) {
                    let user = await findUser(username)
                    if (!user) {
                        message.channel.send(`Couldn't find user "${username}"`)
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
                        message.channel.send(
                            "Error: To set a reminder to public delivery you must post your command in a public channel"
                        )
                        return
                    }
                    remind.deliver = "pub"
                    remind.channelId = message.channel.id
                    remind.guildId = message.guild.id
                    changes.deliver = "public"
                } else {
                    message.channel.send(`Error: Please set "deliver" to "pub" or "dm"`)
                    return
                }
        }
    }
    if (!remind.date) {
        message.channel.send(
            "Error: The reminder must include a date."
        )
        return
    }
    return { remind: remind, changes: changes }
}

module.exports = parseRemindParams