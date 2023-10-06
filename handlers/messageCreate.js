const client = require('../client.js')

//helpers
const sendDm = require('../helpers/sendDm.js')
const get = require('../helpers/get.js')
const sendMessage = require('../helpers/sendMessage.js')

//json
const userIds = require('../json/userIds.json')

//commands
const say = require('../commands/say.js')
const flip = require('../commands/flip.js')
const roll = require('../commands/roll.js')
const help = require('../commands/help.js')
const setCommandChannel = require('../commands/setCommandChannel.js')
const unsetCommandChannel = require('../commands/unsetCommandChannel.js')
const setWelcomeChannel = require('../commands/setWelcomeChannel.js')
const setPrefix = require('../commands/setPrefix.js')
const logMode = require('../commands/logMode.js')
const setWelcomeMessage = require('../commands/setWelcomeMessage.js')
const unsetWelcomeMessage = require('../commands/unsetWelcomeMessage.js')
const remind = require('../commands/remind.js')
const cancelRemind = require('../commands/cancelRemind.js')
const viewRemind = require('../commands/viewRemind.js')
const editRemind = require('../commands/editRemind.js')
const nameDisplay = require('../commands/nameDisplay.js')
const setRulesMessage = require('../commands/setRulesMessage.js')
const enableCommandSecurity = require('../commands/enableCommandSecurity.js')
const disableCommandSecurity = require('../commands/disableCommandSecurity.js')

async function messageCreate(message) {
    if (message.author.bot) return;

    let settings = { prefix: "!" }
    if (message.guild) {
        settings = await get("settings", message.guild.id)
        if (!settings) {
            console.log("couldn't get settings")
            return
        }
    }

    const prefix = settings.prefix

    //non-commands
    if (message.mentions && message.mentions.users.get(client.user.id)) {
        sendMessage(message.channel, `my prefix here is ${prefix} (try ${prefix}help)`)
    }

    const authorId = message.author.id
    if (message.guild===null && authorId!==userIds.gabe && !message.content.startsWith(prefix)) {
        //fwd to me if it's a dm, not command, and im not the author
        //incorrectly entered commands (anything starting with prefix) will not fwd to me
        sendMessage(message.channel, "Your message has been forwarded")
        sendDm(userIds.gabe, `${message.author.username} said to me: ${message.content}`)
        return
    }

    //return if not a command
    if (!message.content.startsWith(prefix)) return

    //commands
    let messageArray = message.content.slice(1).split(" ")
    const command = messageArray[0].toLowerCase()
    let params = messageArray.slice(1)

    const isDM = !message.guild
    const inCmdChannel = !settings.commandChannelId || settings.commandChannelId===message.channel.id

    if (isDM || inCmdChannel) {
        switch (command) {
            case "say":
                say(params, message)
                return
            case "flip":
                flip(message)
                return
            case "roll":
                roll(params, message)
                return
            case "help":
                help(message)
                return
            case "remind":
                remind(params, message)
                return
            case "cancelremind":
                cancelRemind(params, message)
                return
            case "viewremind":
                viewRemind(params, message)
                return
            case "editremind":
                editRemind(params, message)
                return
        }
    }

    if (isDM) return

    // check command security
    if (settings.cmdSecurity) {
        try {
            let guildMember = await message.guild.members.fetch(authorId)
            let role = await guildMember.roles.cache.find(r => r.name === "gymothee admin")
            if (!role && authorId!==userIds.gabe) return
        } catch(error) {
            console.log("error checking cmd security")
            return
        }
    }

    if (inCmdChannel) {
        switch (command) {
            case "setprefix":
                setPrefix(params, message)
                return
            case "logmode":
                logMode(params, message)
                return
            case "namedisplay":
                nameDisplay(params, message)
                return
            case "setwelcomemessage":
                setWelcomeMessage(params, message)
                return
            case "unsetwelcomemessage":
                unsetWelcomeMessage(message)
                return
            case "enablecommandsecurity":
                enableCommandSecurity(message)
                return
            case "disablecommandsecurity":
                disableCommandSecurity(message)
                return
        }
    }

    switch (command) {
        case "setcommandchannel":
            setCommandChannel(message)
            return
        case "unsetcommandchannel":
            unsetCommandChannel(message)
            return
        case "setwelcomechannel":
            setWelcomeChannel(message)
            return
        case "setrulesmessage":
            setRulesMessage(message)
            return
    }
}

module.exports = messageCreate
