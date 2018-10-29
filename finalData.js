// lesanche [3:09 PM]
// - nom - prenom - genre - date piscine - piscine validee ou non - niveau atteint a la fin de la piscine -

const fs = require('fs');
const Utils = require('./src/utils.js');
const prompt = require('prompt');
const colors = require('colors/safe');

const parse = {
	properties: {
		filepath: {
			description: 'Enter the users profiles filepath',
			type: 'string',
			required: true
		}
	}
};

prompt.start();

prompt.message = colors.green('TestAPI42 Parse');
prompt.delimiter = ': ';

prompt.get(parse, (err, res) => {
	if(err) {
		console.error(err);
	}
	handleFile(res.filepath);
});

function handleFile(filePath) {
	Utils.readFilePromise(filePath)
		.then(data => {
			let users = JSON.parse(data);
			let finalData = [];
			for(let i = 0; i < users.length; ++i) {
				let user = {
					firstName = users[i].first_name,
					lastName = users[i].last_name,
					gender = users[i].gender,
					genderProbability = user[i].probability,
					poolDate = new Date(`${users[i].pool_month} ${users[i].pool_year}`),
					admitted = user[i].achievements
				}
			}
			return getNamesLoop(users, names, 0);
		})
		.then(users => {
			Utils.writeFilePromise('./results/test', users);
		})
		.catch(err => {
			console.error(err);
		});
}