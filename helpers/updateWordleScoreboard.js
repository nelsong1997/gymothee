const userIds = require('../json/userIds.json')

async function updateWordleScoreboard(message) {
    let gamers = {}
    const wordleRegex = /Wordle [0-9]{3} ([1-6]|X)\/6/

    // REF: https://github.com/iColtz/discord-fetch-all/blob/main/src/functions/fetchMessages.js
    // Reads all messages in the channel
    let lastFetchID;
    let keepFetching = true;
    let scoreboardMsg = null;
    while (keepFetching) {
        let fetchedMessages = await message.channel.messages.fetch({ 
            limit: 100,
            ...(lastFetchID && { before: lastFetchID }),
        })
        
        if (fetchedMessages.size===0) keepFetching = false

        for (let [msgId, msg] of fetchedMessages){
            if (wordleRegex.test(msg)) {
                let scoreIndex = msg.content.search(wordleRegex) + 11
                let score = msg.content.slice(scoreIndex, scoreIndex + 1)
                score = score==="X" ? 7 : Number(score)
                if (gamers[msg.author.id]) gamers[msg.author.id].scores.push(score)
                else gamers[msg.author.id] = { scores: [score], name: msg.author.username }
            } else if (
                msg.content.includes("Wordle Scoreboard") &&
                (
                    msg.author.id===userIds.gymothee ||
                    msg.author.id===userIds.gymotheeTest
                )
            ) scoreboardMsg = msg
        }
        lastFetchID = fetchedMessages.lastKey();
    }

    let scoreboardArray = []
    let longestName = 0
    for (let gamerId in gamers) {
        let gamer = gamers[gamerId]
        let scores = gamer.scores
        scoreboardArray.push({
            name: gamer.name,
            avgScore: scores.reduce((a,b) => a + b, 0) / scores.length,
            tries: scores.length
        })
        if (gamer.name.length > longestName) longestName = gamer.name.length
    }

    scoreboardArray.sort((a,b) => {
        if (a.avgScore!==b.avgScore) return a.avgScore - b.avgScore
        else return b.tries - a.tries 
    })
    //need to rank players with a true tie with the same rank

    //let's make a table of the scores
    //to space the table properly we have to space around shorter names
    //we'll calc the # of spaces based on how long the longest name is
    let spcNum = longestName - 5
    let spcStr = " ".repeat(spcNum)

    let sendThis = "``Wordle Scoreboard\n"
    sendThis += `rank | ${spcStr}gamer | avg score | tries \n`
    sendThis += `-----|${"-".repeat(spcNum)}-------|-----------|-------\n`
    for (let i=0; i<scoreboardArray.length; i++) {
        let gamer = scoreboardArray[i]
        let rankStr = (i + 1).toString()
        let rankSpc = rankStr.length===1 ? " " : ""
        let nameSpcNum = longestName - gamer.name.length
        let nameSpc = " ".repeat(nameSpcNum)
        let triesStr = gamer.tries.toString()
        let endSpcNum = 6 - triesStr.length
        let endSpc = " ".repeat(endSpcNum)
        sendThis += `  ${rankSpc}${i+1} | ${nameSpc}${gamer.name} | ${gamer.avgScore.toFixed(2)}      | ${gamer.tries}${endSpc}\n`
    }
    sendThis += "``"
    if (sendThis.length > 2000) return //should do something else. this prevents crash

    if (scoreboardMsg) scoreboardMsg.edit(sendThis)
    else {
        message.channel.send(sendThis).then((newMsg) => {
            try {
                newMsg.pin()
            } catch (err) {
                console.log("failed to pin msg, probably not an admin!")
            }
        })
    }
}

module.exports = updateWordleScoreboard