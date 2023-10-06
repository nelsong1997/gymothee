// client
const client = require('../client.js')

// helpers
const get = require('../helpers/get.js')
const post = require('../helpers/post.js')
const sendMessage = require('../helpers/sendMessage.js')

async function messageReactionAdd(messageReaction, user) {
    let rules = await get("rules", messageReaction.message.guildId)
    if (!rules) {
        console.log("couldn't get rules")
        return
    }

    // set emoji
    if (rules.isSettingRules && messageReaction.message.id === rules.reactToMsg) {
        rules.isSettingRules = false
        const errMsg = "failed to delete messages while setting rules message"
        try {
            let channel = await client.channels.fetch(rules.channelId)
            let reactToMsg = await channel.messages.fetch(rules.reactToMsg)
            reactToMsg.delete().catch(() => console.log(errMsg))
            let commandMsg = await channel.messages.fetch(rules.commandMsg)
            commandMsg.delete().catch(() => console.log(errMsg))
            rules.reactToMsg = null
            rules.commandMsg = null
        } catch (error) {
            console.log(errMsg)
        }
        rules.agreeEmojiId = messageReaction._emoji.name.codePointAt()
        await post("rules", rules, messageReaction.message.guildId)

    // agree to rules
    } else if (rules.agreeEmojiId &&
      messageReaction._emoji.name.codePointAt() === rules.agreeEmojiId && 
      messageReaction.message.id === rules.rulesMsg) {
        let guildMember = await messageReaction.message.guild.members.fetch(user.id)
        guildMember.roles.add(rules.roleId).catch(()=>{
            sendMessage(messageReaction.message.channel,
                `Error: Missing permissions to assign "rule agreers" role.`
            )
        })
    }
}

module.exports = messageReactionAdd