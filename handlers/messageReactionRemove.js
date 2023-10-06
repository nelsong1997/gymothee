// helpers
const get = require('../helpers/get.js')
const sendMessage = require('../helpers/sendMessage.js')

async function messageReactionRemove(messageReaction, user) {
    let rules = await get("rules", messageReaction.message.guildId)
    if (!rules) {
        console.log("couldn't get rules")
        return
    }

    if (rules.agreeEmojiId &&
      messageReaction._emoji.name.codePointAt() === rules.agreeEmojiId && 
      messageReaction.message.id === rules.rulesMsg) {
        let guildMember = await messageReaction.message.guild.members.fetch(user.id)
        guildMember.roles.remove(rules.roleId).catch(()=>{
            sendMessage(messageReaction.message.channel,
                `Error: Missing permissions to remove "rule agreers" role.`
            )
        })
    }
}

module.exports = messageReactionRemove