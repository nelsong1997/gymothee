//client
const client = require('../client.js')

async function messageReactionAdd(messageReaction, user) {
    let rules = await get("rules", messageReaction.message.guildId)
    if (!rules) {
        console.log("couldn't get rules")
        return
    }

    // set emoji
    if (rules.isSettingRules && messageReaction.message.id === rules.reactToMsg) {
        rules.isSettingRules = false
        try {
            let reactToMsg = client.messages.get(rules.reactToMsg)
            reactToMsg.delete()
            let commandMsg = client.messages.get(rules.commandMsg)
            commandMsg.delete()
        } catch (error) {
            console.log("couldn't delete messages")
        }
        rules.reactToMsg = null
        rules.commandMsg = null
        rules.agreeEmoji = messageReaction._emoji.name
        await post("rules", messageReaction.message.guildId)

    // agree to rules
    } else if (rules.agreeEmoji &&
      messageReaction._emoji.name === rules.agreeEmoji && 
      messageReaction.message.id === rules.rulesMsg) {
        // assign role etc
    } else return
}

module.exports = messageReactionAdd