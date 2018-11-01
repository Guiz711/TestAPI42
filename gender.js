const Popsicle = require('popsicle');
const prompt = require('prompt');
const colors = require('colors/safe');
const Utils = require('./src/utils.js');

const gender = {
	properties: {
		filepath: {
			description: 'Enter the users profiles filepath',
			type: 'string',
			required: true
		}
	}
};

prompt.start();

prompt.message = colors.green('TestAPI42 Gender');
prompt.delimiter = ': ';

prompt.get(gender, (err, res) => {
	if(err) {
		console.error(err);
	}
	handleFile(res.filepath);
});

function handleFile(filePath) {
	Utils.readFilePromise(filePath)
		.then(data => {
			let users = JSON.parse(data);
			let names = [];
			for(let i = 0; i < users.length; ++i) {
				names.push(users[i].first_name);
			}
			return getNamesLoop(users, names, 0);
		})
		.then(users => {
			Utils.writeFilePromise(filePath, JSON.stringify(users));
		})
		.catch(err => {
			console.error(err);
		});
}

function getNamesLoop(users, names, pos) {
	let reqString = '/?';
	for(let i = 0; (i + pos) < names.length && i < 10; ++i) {
		reqString += `&name[${i}]=${names[pos + i]}`;
	}
	return new Promise((resolve, reject) => {
		getGender(reqString)
			.then(data => {
				data = JSON.parse(data.body);
				for(let i = pos; i < names.length && i < pos + 10; ++i) {
					users[i].gender = data[i % 10].gender;
					users[i].probability = data[i % 10].probability;
				}
				if((pos + 11) > names.length)
					resolve(users);
				else {
					pos += 10;
					resolve(getNamesLoop(users, names, pos));
				}
			})
			.catch(err => reject(err));
	});
}

function getGender(reqString) {
	return Popsicle.request('https://api.genderize.io' + reqString);
}