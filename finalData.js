// lesanche [3:09 PM]
// - nom - prenom - genre - date piscine - piscine validee ou non - niveau atteint a la fin de la piscine -
// piscine validée ou non => a débloqué l'achievement "Welcome, Cadet !"

const fs = require('fs');
const Utils = require('./src/utils.js');
const prompt = require('prompt');
const colors = require('colors/safe');

const parse = {
	properties: {
		folderPath: {
			description: 'Enter the users profiles folder path',
			type: 'string',
			required: true
		}
	}
};

prompt.start();

prompt.message = colors.green('TestAPI42 Parse');
prompt.delimiter = ': ';

prompt.get(parse, (err, res) => {
	if(err)
		console.error(err);

	if(res.folderPath[res.folderPath.length - 1] !== '/')
		res.folderPath += '/';

	fs.readdir(res.folderPath, {withFileTypes: true}, (err, files) => {
		let regex = /.*profiles\.json$/gm;
		filePaths = files.filter(file => regex.test(file));
		for(let i = 0; i < filePaths.length; ++i) {
			filePaths[i] = res.folderPath + filePaths[i];
		}
		handleFile(filePaths, [], 0)
			.then(data => {
				let fileName = res.folderPath + 'final_result.json';
				Utils.writeFilePromise(fileName, JSON.stringify(data));
			})
	})
});

function handleFile(filePaths, finalData, index) {
	return new Promise((resolve, reject) => {
		Utils.readFilePromise(filePaths[index])
			.then(data => {
				let users = JSON.parse(data);
				
				for(let i = 0; i < users.length; ++i) {
					if(users[i] === undefined)
						console.log(i);
					let user = {};
					user.firstName = users[i].first_name;
					user.lastName = users[i].last_name;
					user.gender = users[i].gender;
					user.genderProbability = users[i].probability !== undefined ? users[i].probability : null;
					user.poolDate = new Date(`${users[i].pool_month} ${users[i].pool_year}`);
					user.admitted = users[i].achievements.some(elem => elem.id === 1);
					let poolCursus = users[i].cursus_users.find(cursusUser => cursusUser.cursus_id === 6);
					if(poolCursus === undefined) {
						user.poolLevel = null;
					} else {
						user.poolLevel = poolCursus.level;
					}
					finalData.push(user);
				}
				
				if(index < filePaths.length - 1) {
					index++;
					resolve(handleFile(filePaths, finalData, index));
				} else {
					resolve(finalData);
				}
			})
			.catch(err => {
				reject(err);
			});
	});
}