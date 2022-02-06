const client = require('../client.js')

//helpers
const sendDm = require('../helpers/sendDm.js')
const get = require('../helpers/get.js')

//json
const userIds = require('../json/userIds.json')

//commands
const say = require('../commands/say.js')
const flip = require('../commands/flip.js')
const log = require('../commands/log.js')
const roll = require('../commands/roll.js')
const help = require('../commands/help.js')
const setCommandChannel = require('../commands/setCommandChannel.js')
const unsetCommandChannel = require('../commands/unsetCommandChannel.js')
const setLogChannel = require('../commands/setLogChannel.js')
const setWelcomeChannel = require('../commands/setWelcomeChannel.js')
const setPrefix = require('../commands/setPrefix.js')
const logMode = require('../commands/logMode.js')
const setWelcomeMessage = require('../commands/setWelcomeMessage.js')
const unsetWelcomeMessage = require('../commands/unsetWelcomeMessage.js')
const remind = require('../commands/remind.js')
const cancelRemind = require('../commands/cancelRemind.js')
const viewRemind = require('../commands/viewRemind.js')
const editRemind = require('../commands/editRemind.js')

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
        message.channel.send(`my prefix here is ${prefix} (try ${prefix}help)`)
    }

    if (message.guild===null && message.author.id!==userIds.gabe && !message.content.startsWith(prefix)) {
        //fwd to me if it's a dm, not command, and im not the author
        //incorrectly entered commands (anything starting with prefix) will not fwd to me
        message.channel.send("Your message has been forwarded")
        sendDm(userIds.gabe, `${message.author.username}#${message.author.discriminator} said to me: ${message.content}`)
        return
    }
    
    if (!message.content.startsWith(prefix)) return //return if not a command
    
    //commands
    let messageArray = message.content.slice(1).split(" ")
    let command = messageArray[0].toLowerCase()
    let params = messageArray.slice(1)

    if (
        !settings.commandChannelId || //there is no command channel OR this is a DM OR
        settings.commandChannelId===message.channel.id //we're in the command channel
    ) {
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

    if (
        message.guild && //NOT a DM AND
        (settings.commandChannelId===message.channel.id ||
        !settings.commandChannelId)
    ) { //must be in command channel or there is no command channel
        switch (command) {
            case "log":
                log(params, message)
                return
            case "setprefix":
                setPrefix(params, message)
                return
            case "logmode":
                logMode(params, message)
                return
            case "setwelcomemessage":
                setWelcomeMessage(params, message)
                return
            case "unsetwelcomemessage":
                unsetWelcomeMessage(message)
                return
        }
    }

    if (message.guild) { //valid outside command channel but must not be dm
        switch (command) {
            case "setcommandchannel":
                setCommandChannel(message)
                return
            case "unsetcommandchannel":
                unsetCommandChannel(message)
                return
            case "setlogchannel":
                setLogChannel(message)
                return
            case "setwelcomechannel":
                setWelcomeChannel(message)
                return
        }
    }
}

module.exports = messageCreate
