const fs = require('fs');
const CampusList = require('../resources/campus.json');

function writeFilePromise(path, data, options) {
	return ret = new Promise((resolve, reject) => {
		fs.writeFile(path, data, options, err => {
			if (err)
				reject(err);
			else
				resolve(`${path} written succesfully`);
		})
	});
}

function getCampusIdByName(campusName) {
	campusName = campusName.toLowerCase();
	for (i = 0; i < CampusList.length; ++i) {
		let name = CampusList[i].name.toLowerCase();
		if (name == campusName)
			return CampusList[i].id;
	}
	return -1;
}

function sleep(milliseconds, valueToPass) {
	return new Promise(resolve => {
		setTimeout(valueToPass => {
			resolve(valueToPass);
		}, milliseconds, valueToPass);
	});
}

module.exports.writeFilePromise = writeFilePromise;
module.exports.getCampusIdByName = getCampusIdByName;
module.exports.sleep = sleep;
