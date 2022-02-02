//helpers
const get = require('../helpers/get.js')
const post = require('../helpers/post.js')
const sendDm = require('../helpers/sendDm.js')

//json
const userIds = require('../json/userIds.json')

async function cancelRemind(params, message) {
    //if someone is in the "who" array they can remove themselves from the arr
    //once this is done, 
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
    } else if (authorId===theRemind.creator || authorId===userIds.gabe) {
        //permissions
        //creator can cancel the remind, it gets deleted
        //I am all powerful I can cancel any reminder i want >:)
        reminds = reminds.slice(0, index).concat(reminds.slice(index + 1))
        let result = await post('reminds', reminds)
        if (result) message.channel.send(`Reminder with id: ${remindId} cancelled.`)
    } else if (theRemind.whom.includes(authorId)) {
        if (theRemind.whom.length===1) {
            //if no one else is in there, it gets deleted
            reminds = reminds.slice(0, index).concat(reminds.slice(index + 1))
            let result = await post('reminds', reminds)
            if (result) {
                message.channel.send(`Reminder with id: ${remindId} cancelled.`)
                //someone removing themselves should notify creator
                sendDm(
                    theRemind.creator,
                    `User: ${message.author.username}#${message.author.discriminator} ` +
                    `removed themselves from your reminder with id: ${remindId}. ` +
                    `Since this was the only user in your reminder, the reminder was deleted.`
                )
            } else {
                message.channel.send(`Failed to cancel remind with id: ${remindId}.`)
            }
        } else if (theRemind.whom.length > 1) {
            let authorIndex = reminds[index].whom.indexOf(authorId)
            reminds[index].whom = reminds[index].whom.slice(0, authorIndex).concat(reminds[index].whom.slice(authorIndex + 1))
            let result = await post('reminds', reminds)
            if (result) {
                message.channel.send(`You were removed from reminder with id: ${remindId}.`)
                //someone removing themselves should notify creator
                sendDm(
                    theRemind.creator,
                    `User: ${message.author.username}#${message.author.discriminator} ` +
                    `removed themselves from your reminder with id: ${remindId}. `
                )
            } else {
                message.channel.send(`Failed to remove you from reminder with id: ${remindId}.`)
            }
        } else console.log("exception 12512561 within cancelRemind: empty whom")
    } else {
        message.channel.send(
            `You cannot cancel reminder with id: ${remindId} since you are ` +
            `not the creator of nor are you included in this reminder.`
        )
    }
}

module.exports = cancelRemind