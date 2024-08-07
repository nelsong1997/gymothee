//client
const client = require('../client.js')

//helpers
const post = require('../helpers/post.js')
const sendMessage = require('../helpers/sendMessage.js')

async function setRulesMessage(message) {
    // not a reply
    if (message.type !== 19) {
        sendMessage(message.channel, "Error: Command is not a reply")
        return
    }

    let role = message.guild.roles.cache.find(r => r.name === "rule agreers")
    if (!role) {
        sendMessage(message.channel, `Error: Please create a role called "rule agreers"`)
        return
    }

    let reactToMsg = await message.channel.send(
        "To finalize rules message setup, react to this message " +
        "with the emoji users should use to agree to the rules."
    )

    let rules = {
        reactToMsg: reactToMsg.id,
        commandMsg: message.id,
        isSettingRules: true,
        rulesMsg: message.reference.messageId,
        roleId: role.id,
        channelId: message.channel.id
    }

    await post("rules", rules, message.guild.id)
}

module.exports = setRulesMessage