function flip (message) {
    let roll = Math.random()
    if (roll < 0.5) message.channel.send("heads")
    else message.channel.send("tails")
}

module.exports = flip