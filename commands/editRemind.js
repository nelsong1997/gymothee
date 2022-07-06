//helpers
const get = require('../helpers/get.js')
const post = require('../helpers/post.js')
const sendDm = require('../helpers/sendDm.js')
const sendReminder = require('../helpers/sendReminder.js')
const parseRemindParams = require('../helpers/parseRemindParams.js')

//json
const userIds = require('../json/userIds.json')

async function editRemind(params, message) {
    let remindId = params[0]
    let reminds = await get('reminds')
    if (!reminds) return

    let index = null
    for (let i=0; i<reminds.length; i++) {
        if (remindId===reminds[i].id) {
            index = i
            break;
        }
    }
    let theRemind = reminds[index]
    let authorId = message.author.id
    if (index===null) {
        message.channel.send(`Failed to find reminder with id: ${remindId}`)
        return
    }
    let oldWhom = theRemind.whom.slice(0)
    if (authorId===theRemind.creator || authorId===userIds.gabe) {
        let keyValuePairs = params.slice(1).join(" ").split("; ")
        let result = await parseRemindParams(message, theRemind, keyValuePairs)
        if (!result) return //parse func will send msgs
        reminds[index] = result.remind
        let changes = result.changes
        
        let thePost = await post('reminds', reminds)
        if (!thePost) message.channel.send('Failed to edit reminder.')
        else {
            if (changes.date) {
                let now = new Date()
                let newDate = reminds[index].date
                let nextMidnight = new Date()
                nextMidnight.setDate(nextMidnight.getDate() + 1)
                nextMidnight.setHours(0, 0, 0, 0)
                if (newDate < nextMidnight) {
                    let dif = newDate - now
                    setTimeout(() => sendReminder(theRemind.id, theRemind.date), dif)
                    // console.log(
                    //     "did immediately set timeout for reminder since new date is before midnight",
                    //     theRemind.id, now.toLocaleString('en-us')
                    // )
                }
            }
            let sendThis = ""
            for (let key in changes) {
                sendThis += `${key} was changed to: ${changes[key]}; `
            }
            sendThis = sendThis.slice(0, sendThis.length - 2)
            message.channel.send("Reminder edited. " + sendThis)
            if (reminds[index].repeat) { //probably bad practice to pre-notify someone for a reminder they'll receive once
                for (let userId of reminds[index].whom) {
                    if (userId===message.author.id) continue;
                    if (!oldWhom.includes(userId)) {
                        sendDm(
                            userId,
                            `You were added to a reminder with id ${theRemind.id}. ` +
                            `Use "viewremind" command to view details.`
                        )
                    } else {
                        sendDm(userId, `Reminder with id ${theRemind.id} was edited. ` + sendThis)
                    }
                }
            }
            
        }
    } else {
        message.channel.send(
            `You cannot edit reminder with id: ${remindId} since you did ` +
            `not create it. If you would like to removed from this reminder, ` +
            `use the "cancelremind" command.`
        )
    }
}

module.exports = editRemind