//helpers
const logItemsToString = require('../helpers/logItemsToString.js')
const cleanUpVoiceLog = require('../helpers/cleanUpVoiceLog.js')
const get = require('../helpers/get.js')

async function log (params, message) {
    let guildId = message.guild.id
    if (!guildId) return //no longer works in dms
    let settings = await get("settings", guildId)
    if (!settings) return
    const logMode = settings.logMode

    if (logMode==="off") {
        message.channel.send(`Voice logging is currently disabled. Please use ${settings.prefix}logmode to enable!`)
        return
    } else if (logMode!=="passive") {
        message.channel.send(
            `Log mode is currently "${logMode}." The "log" command is only available in ` +
                `"passive" mode.`
        )
        return
    }
        
    let voiceLog = await cleanUpVoiceLog(guildId)
    if (!voiceLog) {
        message.channel.send("An error occurred while getting logs.")
        return
    }

    let sendThis = ""

    voiceLog = voiceLog.reverse() //newest logs come first

    if (params[0]==="length") { //how many logs are there
        message.channel.send(voiceLog.length.toString())
        return
    }

    let range = [0, 5]
    let rangeString = params[1]
    let startDate = null
    let endDate = null

    if (!rangeString) rangeString = "5"
    else if (rangeString.includes(":")) { //time based
        let now = new Date()
        endDate = now
        startDate = new Date((Date.parse(now) - 86400000)) //24hrs ago
        function timeStrToDate(str, todaysDate) {
            let timeArray = str.split(":")
            let hour = Number(timeArray[0])
            let minuteStr = timeArray[1].slice(0, 2)
            let minute = Number(minuteStr)

            if (str.toLowerCase().includes("pm") && hour !== 12) hour += 12
            if (str.toLowerCase().includes("am") && hour === 12) hour -= 12
            if (
                (!hour && hour!==0) || hour < 0 || hour > 23 ||
                (!minute && minute!==0) || minute < 0 || minute > 59
            ) { return undefined }
            let goodDateString = hour + ":" + minuteStr + " " + todaysDate
            let returnDate = new Date(goodDateString)
            if (isNaN(returnDate)) return undefined //invalid date
            if (Date.parse(returnDate) > Date.now()) { //we got ahead of ourselves
                let badDateMs = Date.parse(returnDate)
                returnDate = new Date(badDateMs - 86400000)
            }
            return returnDate
        }

        let todayString = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear()

        if (rangeString.includes("-")) {
            let timesArray = rangeString.split("-")
            startDate = timeStrToDate(timesArray[0], todayString)
            endDate = timeStrToDate(timesArray[1], todayString)
        } else if (rangeString.startsWith("before")) endDate = timeStrToDate(rangeString.slice(6), todayString)
        else if (rangeString.startsWith("after")) startDate = timeStrToDate(rangeString.slice(5), todayString)
        else {
            message.channel.send(`Error: Couldn't parse time specification (1)`)
            return
        }
        if (isNaN(startDate) || isNaN(endDate)) {
            message.channel.send(`Error: Couldn't parse time specification (2)`)
            return
        } else if (endDate < startDate) {
            message.channel.send(`Error: Start date is after end date`)
            return
        }
    } else { // index range
        if (rangeString.includes("-")) { 
        range = rangeString.split("-")
        range[0] = Number(range[0])
        range[1] = Number(range[1])
        } else if (rangeString.toLowerCase()==="all") range[1] = voiceLog.length
        else range[1] = Number(rangeString) //nothing specified (gives 5 most recent)

        if (
            (range[0] > range[1]) ||
            isNaN(range[0]) || isNaN(range[1])
        )
        {
            message.channel.send("Error: Bad log range.")
            return
        }
    }
    
    //forming string based off of log command type (param[0]--all, peruser, user)
    if (params[0]==="all") { //!log all 5
        let logItems = []
        if (startDate) {
            for (let logItem of voiceLog) {
                let timeStamp = new Date(logItem.timeStamp)
                if (timeStamp > startDate && timeStamp < endDate) {
                    logItems.push(logItem)
                }
            }
        } else logItems = voiceLog.slice(range[0], range[1])
        sendThis = await logItemsToString(logItems.reverse(), true, false, guildId) || "No logs :("
    } else if (params[0]==="peruser") {//!log peruser 5
        let uniqueUsers = []
        let logItems = []
        for (let i=0; i<voiceLog.length; i++) {
            let logItem = voiceLog[i]
            let timeStamp = new Date(logItem.timeStamp)
            if (startDate && (timeStamp < startDate || timeStamp > endDate)) continue
            let currentUserId = logItem.userId
            if (!uniqueUsers.includes(currentUserId)) {
                logItems.push(logItem)
                uniqueUsers.push(currentUserId)
                if (logItems.length >= range[1]) break
            }
        }
        logItems = logItems.slice(range[0])
        sendThis = await logItemsToString(logItems.reverse(), true, false, guildId) || "No Logs :("
    } else if (params[0]==="user")  { //!log user 5 {id}
        let userId = params[2]
        let logItems = []
        for (let i=0; i<voiceLog.length; i++) {
            let logItem = voiceLog[i]
            let timeStamp = new Date(logItem.timeStamp)
            if (startDate && (timeStamp < startDate || timeStamp > endDate)) continue
            if (userId===logItem.userId) {
                logItems.push(logItem)
                if (logItems.length >= range[1]) break
            }
        }
        logItems = logItems.slice(range[0])
        sendThis = await logItemsToString(logItems.reverse(), true, false, guildId) || "No Logs :("
    } else {
        message.channel.send(`Error: Invalid log type. Try "all", "peruser", or "user"`)
        return
    }
    if (sendThis.length > 2000) {
        message.channel.send(`Error: Too many logs (Char limit exceeded: ${sendThis.length}/2000)`)
        return
    }
    message.channel.send(sendThis)
}

module.exports = log