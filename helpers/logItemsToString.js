//helpers
const displayName = require("../helpers/displayName")

async function logItemsToString(items, includeTime, hideChannel, guildId) {
    let logsString = ""
    for (let logItem of items) {
        if (!hideChannel) {
            let timeString = ""
            if (includeTime) timeString = ` at ${dateToString(logItem.timeStamp)}`
            switch (logItem.changeType) {
                case "join":
                    logsString += (
                        `${await displayName(logItem.userId, guildId)} joined **${logItem.newChannelName}**${timeString}.\n`
                    )
                    break;
                case "leave":
                    logsString += (
                        `${await displayName(logItem.userId, guildId)} left **${logItem.oldChannelName}**${timeString}.\n` 
                    )
                    break;
                case "move":
                    logsString += (
                        `${await displayName(logItem.userId, guildId)} left **${logItem.oldChannelName}** and ` +
                        `joined **${logItem.newChannelName}**${timeString}.\n`
                    )
            }
        } else {
            //when hideChannel is true, includeTime should always be false
            switch (logItem.changeType) {
                case "join":
                    logsString = `${await displayName(logItem.userId, guildId)} joined.\n`
                    break;
                case "leave":
                    logsString = `${await displayName(logItem.userId, guildId)} left.\n`
            }
        }
    }
    return logsString
}

function dateToString(dateString) {
    const date = new Date(dateString)
    let spaceyDate = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'}) //9:03 AM
    let formattedDate = spaceyDate.split(" ").join("").toLowerCase() //9:03am
    return (
        `${formattedDate} ` +
        `on ${new Intl.DateTimeFormat('en-US', { weekday: "long" } ).format(date)}` //Saturday
    )
}

module.exports = logItemsToString