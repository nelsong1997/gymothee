const fetch = require('node-fetch')

async function get(what, guildId) {
    //should consider replacing a lot of uses of this func with simply "require"
    let result;
    let promise = new Promise(async function (resolve, reject) {
        setTimeout(() => {
            if (result===undefined) reject(`Err: getting ${what} timed out`);
        }, 10000);
        try {
            let appendThis = "" //should change routing and url to clean this up
            if (guildId) appendThis = `&guildId=${guildId}`
            let resource = await fetch(`http://localhost:5000/get?what=${what}${appendThis}`, {
                method: "GET",
                headers: { 'Content-Type': 'application/json' }
            })
            resource = await resource.json()
            resolve(resource)
        } catch (error) {
            reject(`Err: getting ${what} failed: ${error}`)
        }
    }).catch((error) => {
        console.log(error)
        return null
    })
    result = await promise
    return result
}

module.exports = get