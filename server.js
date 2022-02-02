const express = require('express')
const app = express()
const fs = require('fs')
const defaultSettings = require('./json/defaultSettings.json')

app.get('/get', (request, response) => {
    let what = request.query.what
    let guildId = request.query.guildId
    if (!guildId) {
		const data = fs.readFileSync(`./json/${what}.json`);
		const json = JSON.parse(data);
		response.type('json').send(json)
    } else {
		fs.readFile(`./json/${what}/${guildId}.json`, (err, data) => {
			if (err && (err.errno===-4058 || err.errno===-2)) { //no such file or directory; win || linux
				let writeThis = ""
				if (what==="voiceLogs") writeThis = "[]"
				else if (what==="settings") writeThis = JSON.stringify(defaultSettings)
				fs.writeFile(`./json/${what}/${guildId}.json`, writeThis, function(error) { //create new file
					if (error) {
						console.log("bad post (1)", error)
						return
					} else response.type('json').send(writeThis)
				})
			} else if (err) { //unpredicted error
				console.log("bad get", err)
				return
			} else { //if the log file already exists
				const json = JSON.parse(data);
				response.type('json').send(json)
			}
		})
	}
})

app.post('/post', express.json(), (request, response) => {
	let what = request.query.what
	let guildId = request.query.guildId
	if (!guildId) {
		fs.writeFileSync(`./json/${what}.json`, JSON.stringify(request.body));
		response.status(201).send()
	} else {
		let jsonString = JSON.stringify(request.body)
		try {
			JSON.parse(jsonString)
			fs.writeFileSync(`./json/${what}/${guildId}.json`, jsonString)
			response.status(201).send()
		} catch (error) {
			console.log("I'm bad at making json! whoops!")
			return
		}
	}
})

module.exports = app