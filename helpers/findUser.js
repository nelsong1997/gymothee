const client = require('../client.js')

async function findUser(str) {
    if (!isNaN(Number(str))) { //straight up id
        try {
            let user = client.users.fetch(str)
            return user
        } catch (error) {
            return null
        }
    } else if (str.includes("#")) {
        let id = null;
        for (let guild of client.guilds.cache) {
            if (id) break;
            let guildMembers = await guild[1].members.fetch()
            for (let mem of guildMembers) {
                let member = mem[1]
                let fullName = `${member.user.username}#${member.user.discriminator}`.toLowerCase()
                if (fullName===str.toLowerCase()) {
                    id = member.user.id
                    break;
                }
            }
        }
        if (!id) return null
        try {
            let user = client.users.fetch(id)
            return user
        } catch (error) {
            return null
        }
    }
}

module.exports = findUser