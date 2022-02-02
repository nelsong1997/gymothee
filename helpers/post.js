const fetch = require('node-fetch')

async function post(what, object, guildId) {
    let result;
    let promise = new Promise(async function (resolve, reject) {
        setTimeout(() => {
            reject(`Err: posting ${what} timed out`);
        }, 10000);
        try {
            let appendThis = ""
            if (guildId) appendThis = `&guildId=${guildId}`
            let resource = await fetch(`http://localhost:5000/post?what=${what}${appendThis}`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(object)
            })
            if (resource.status===201) resolve("success")
        } catch (error) {
            reject(`Err: posting ${what} failed: ${error}`)
        }
    }).catch((error) => {
        console.log(error)
        return null
    })
    result = await promise
    return "success"
}

module.exports = post