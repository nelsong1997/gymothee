//helpers
const get = require('../helpers/get.js')
const sendReminder = require('../helpers/sendReminder.js')

//client
const client = require('../client.js')


async function ready() {
    
    dailySetRemindTimeouts()

    setRuleAgreersRole()

}

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

async function setRuleAgreersRole() {
    let guildIds = client.guilds.cache.map(guild => guild.id)
    
    for (let guildId of guildIds) {
        let rules = await get("rules", guildId)
        if (!rules || !rules.channelId || !rules.rulesMsg) continue

        let rulesChannel = await client.channels.fetch(rules.channelId).catch(() => {})
        if (!rulesChannel) continue
        let rulesMessage = await rulesChannel.messages.fetch(rules.rulesMsg).catch(() => {})
        if (!rulesMessage) continue
        
        //console.log(rulesMessage.reactions.cache)
        let trueAgreers = []
        for (let messageReaction of rulesMessage.reactions.cache) {
            let reaction = messageReaction[1]
            if (reaction._emoji.name.codePointAt()!==rules.agreeEmojiId) continue
            
            trueAgreerUsers = await reaction.users.fetch().map(user => user.id)
            console.log(trueAgreers)

            break
        }

        break

        // get list of users who reacted with the specific emoji "trueAgreers"
        // get list of users who have the role "supposedAgreers"
        // for each supposedAgreer...
        //      make sure they're in trueAgreers
        //      if not, remove the role
        // for each trueAgreer...
        //      check to make sure they have the role
        //      if not, add it
    }
}

module.exports = ready