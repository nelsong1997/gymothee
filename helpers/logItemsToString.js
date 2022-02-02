function logItemsToString(items, includeTime) {
    function dateToString(dateString) {
        const date = new Date(dateString)
        let spaceyDate = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'}) //9:03 AM
        let formattedDate = spaceyDate.split(" ").join("").toLowerCase() //9:03am
        return (
            `${formattedDate} ` +
            `on ${new Intl.DateTimeFormat('en-US', { weekday: "long" } ).format(date)}` //Saturday
        )
    }
    let logsString = ""
    for (let logItem of items) {
        let timeString = ""
        if (includeTime) timeString = ` at ${dateToString(logItem.timeStamp)}`
        switch (logItem.changeType) {
            case "join":
                logsString += (
                    `${logItem.username} joined **${logItem.newChannelName}**${timeString}.\n`
                )
                break;
            case "leave":
                logsString += (
                    `${logItem.username} left **${logItem.oldChannelName}**${timeString}.\n` 
                )
                break;
            case "move":
                logsString += (
                    `${logItem.username} left **${logItem.oldChannelName}** and ` +
                    `joined **${logItem.newChannelName}**${timeString}.\n`
                )
        }
    }
    return logsString
}

module.exports = logItemsToString