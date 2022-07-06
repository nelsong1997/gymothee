//helpers
const get = require('./get.js')
const post = require('./post.js')
const sendReminder = require('./sendReminder.js')

async function createReminder(remind) {
    let remindDate = remind.date
    let nextMidnight = new Date()
    nextMidnight.setDate(nextMidnight.getDate() + 1)
    nextMidnight.setHours(0, 0, 0, 0)
    let now = new Date()
    let tillRemind = remindDate - now

    if (tillRemind < 0) {
        return { error: "Error: The end time for this reminder is in the past" }
    } else if (nextMidnight - remindDate > 0) {
        // console.log(`did immediately create timeout for dif==${tillRemind} ${new Date().toTimeString()}`)
        setTimeout(() => sendReminder(remind.id, remindDate), tillRemind)
    }
    
    let reminds = await get('reminds')
    if (!reminds) return { error: "An error occurred while trying to create your reminder" }

    reminds.push(remind)
    let result = await post('reminds', reminds)
    if (!result) return { error: "An error occurred while trying to create your reminder" }
    return remind.id
}

module.exports = createReminder