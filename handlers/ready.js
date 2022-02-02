//helpers
const get = require('../helpers/get.js')
const post = require('../helpers/post.js')
const sendReminder = require('../helpers/sendReminder.js')

// const client = require('../client.js')

async function ready() {
    // console.log(`did enter ready function ${new Date().toTimeString()}`)

    dailySetRemindTimeouts()

    async function dailySetRemindTimeouts() {
        //first decide when to run again (next midnight)
        let now = new Date()
        console.log(`did enter daily function ${now.toLocaleString('en-us')}`)
        let nextMidnight = new Date()
        nextMidnight.setDate(nextMidnight.getDate() + 1)
        nextMidnight.setHours(0, 0, 0, 0) //151 #2
        let tillNextMidnight = nextMidnight - now
        // console.log(`next midnight is: ${nextMidnight.toTimeString()} which is in ${Math.floor(dif/60000)}:${Math.round((dif/1000)%60)}`)
        setTimeout(dailySetRemindTimeouts, tillNextMidnight)

        //get reminds and set timeouts for any which are before next midnight
        let reminds = await get('reminds')
        if (!reminds) return
        for (let i=0; i<reminds.length; i++) {
            let remind = reminds[i]
            let remindDate = new Date(remind.date)
            let tillRemind = remindDate - now
            if (tillRemind < 0) {
                await sendReminder(remind.id, true)
            } else if (tillRemind < tillNextMidnight) {
                setTimeout(() => sendReminder(remind.id), tillRemind)
                console.log(`did set timeout for reminder with id: ${remind.id}`)
            }
        }
    }
}

module.exports = ready