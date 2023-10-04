//client
const client = require('../client.js')

//helpers
const post = require('../helpers/post.js')

async function setRulesMessage(message) {
    // not a reply
    if (message.type !== 19) {
        message.channel.send("Error: Command is not a reply")
        return
    }

    let role = message.guild.roles.cache.find(r => r.name === "rule agreers")
    if (!role) {
        message.channel.send(`Error: Please create a role called "rule agreers"`)
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
        roleId: role.id
    }

    await post("rules", rules, message.guild.id)
}

module.exports = setRulesMessage