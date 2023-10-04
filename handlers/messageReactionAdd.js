// client
const client = require('../client.js')

// helpers
const get = require('../helpers/get.js')
const post = require('../helpers/post.js')

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
            rules.reactToMsg = null
            rules.commandMsg = null
        } catch (error) {
            console.log("couldn't delete messages")
        }
        rules.agreeEmojiId = messageReaction._emoji.name.codePointAt()
        await post("rules", rules, messageReaction.message.guildId)

    // agree to rules
    } else if (rules.agreeEmoji &&
      messageReaction._emoji.name.codePointAt() === rules.agreeEmojiId && 
      messageReaction.message.id === rules.rulesMsg) {
        // assign roles etc
    }
}

module.exports = messageReactionAdd