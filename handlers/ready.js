//helpers
const get = require('../helpers/get.js')
const sendReminder = require('../helpers/sendReminder.js')

//client
//const client = require('../client.js')

async function ready() {
    // console.log(`did enter ready function ${new Date().toTimeString()}`)

    dailySetRemindTimeouts()

    async function dailySetRemindTimeouts() {
        //first decide when to run again (next midnight)
        let now = new Date()
        // console.log(`did enter daily function ${now.toLocaleString('en-us')}`)
        let nextMidnight = new Date()
        nextMidnight.setDate(nextMidnight.getDate() + 1)
        nextMidnight.setHours(0, 0, 0, 0)
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
                //reminder should have already been sent
                await sendReminder(remind.id, remindDate, tillRemind < -5000)
                //buffer added for midnight reminders
                //can't set a negative timeout but they shouldnt be considered late
            } else if (tillRemind < tillNextMidnight) {
                //remind occurs today; set timeout to send it
                setTimeout(() => sendReminder(remind.id, remindDate), tillRemind)
                // console.log(`did set timeout for reminder with id: ${remind.id}`)
            }
        }
    }
}

module.exports = ready