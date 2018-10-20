const Utils = require('./utils.js');
const Popsicle = require('popsicle');
// const ClientOAuth = require('client-oauth2');
const fs = require('fs');
const ProgressBar = require('cli-progress');


/*
** data fields (all optional):
**	- poolYear
**	- poolMonth (example: july)
**	- campus (name, default Paris)
**	- pageNumber
**	- pageSize (max 100)
*/

function poolUsersRequest(token, params) {
	let campusId = params.hasOwnProperty('campus') ? Utils.getCampusIdByName(params.campus) : 1;
	if(campusId == -1)
		campusId = 1;

	let query = { filter: {}, page: {} };
	if(params.hasOwnProperty('poolYear')) {
		query.filter.pool_year = params.poolYear.toString();
	}
	if(params.hasOwnProperty('poolMonth')) {
		query.filter.pool_month = params.poolMonth;
	}
	if(params.hasOwnProperty('pageNumber')) {
		query.page.number = params.pageNumber;
	}
	if(params.hasOwnProperty('pageSize')) {
		query.page.size = params.pageSize;
	}

	return Popsicle.request(token.sign({
		method: 'get',
		url: `https://api.intra.42.fr/v2/campus/${campusId}/users`,
		body: query
	}))/* .use(Popsicle.plugins.parse('json')) */;
}

function getUserRequest(token, userId) {
	return Popsicle.request(token.sign({
		method: 'get',
		url: `https://api.intra.42.fr/v2/users/${userId}`
	}));
}

/*
** get all pool users with successive requests
*/

function getAllPoolUsers(token, params) {
	const bar = new ProgressBar.Bar();
	return _getAllPoolUsers(token, bar, params)
}

function _createPoolResultFile(data, year, month, pageNumber) {
	let dir = `${year}_${month}_pool`;
	if (!fs.existsSync(`./Results/${dir}`))
		fs.mkdirSync(`./Results/${dir}`);
	let fileName = `users_${pageNumber}`;
	Utils.writeFilePromise(`./Results/${dir}/${fileName}.json`, data)
		.catch(err => console.error(err));
}

function _rateLimitHandling(res) {
	if (res.headers['x-hourly-ratelimit-remaining'] == 0) {
		throw("Hourly Rate Limit Exceeded");
	} else if (res.headers['x-secondly-ratelimit-remaining'] == 0) {
		return Utils.sleep(1000, res);
	} else {
		return res;
	}
}

function _poolUsersRequestLoopHandling(res, token, bar, params, currentPage) {
	if (currentPage === undefined) {
		currentPage = Math.ceil(res.headers['x-total'] / res.headers['x-per-page']);
		if (currentPage > 1) {
			bar.start(currentPage, 1);
			return(_getAllPoolUsers(token, bar, params, currentPage));
		} else {
			bar.stop()
			return true;
		}
	} else if (currentPage > 1) {
		bar.increment()
		return(_getAllPoolUsers(token, bar, params, --currentPage));
	} else {
		bar.stop();
		return true;
	}
}

function _getAllPoolUsers(token, bar, params, currentPage) {
	if(currentPage !== undefined)
		params.pageNumber = currentPage;
	else
		params.pageNumber = 1;

	return new Promise((resolve, reject) => {
		poolUsersRequest(token, params)
			.then(res => {
				if (res.status == 429) {
					reject({error: "Rate Limit Exceeded", result: res});
				} else if (res.status == 200) {
	
					let page = currentPage !== undefined ? currentPage : 1;
					_createPoolResultFile(res.body, params.poolYear, params.poolMonth, page);
	
					try {
						return _rateLimitHandling(res);
					}
					catch(err) {
						reject(err);
					}
				} else {
					reject(`API response error: ${res.body}`);
				}
			})
			.then(res => {
				resolve(_poolUsersRequestLoopHandling(res, token, bar, params, currentPage));
			})
			.catch(err => reject(err))
	})
}

function getAllUsers(token, filePath) {
	const bar = new ProgressBar.Bar();
	Utils.getStudentsIdFromFile(filePath)
		.then(idList => {
			bar.start(idList.length, 0);
			return _getAllUsers(token, idList, 0, [], bar);
		})
		.then(resBuffer => {
			bar.stop();
			filePath = filePath.replace(/\.[^/.]+$/, "") + '_profiles.json';
			Utils.writeFilePromise(filePath, JSON.stringify(resBuffer))
				.catch(err => {
					console.error(err);
				})
		})
		.catch(err => {
			throw err;
		});
}

function _usersRequestLoopHandling(token, idList, listPos, resBuffer, bar) {
	listPos++;
	if (listPos <  idList.length) {
		return(_getAllUsers(token, idList, listPos, resBuffer, bar));
	} else {
		return resBuffer;
	}
}

function _getAllUsers(token, idList, listPos, resBuffer, bar) {
	return new Promise((resolve, reject) => {
		getUserRequest(token, idList[listPos])
			.then(res => {
				if (res.status == 429) {
					reject({error: "Rate Limit Exceeded", result: res});
				} else if (res.status == 200) {
					resBuffer.push(JSON.parse(res.body));
					// _updateProfileDataBuffer(res.body, resBuffer);
	
					try {
						return _rateLimitHandling(res);
					}
					catch(err) {
						reject(err);
					}
				} else {
					reject(`API response error: ${res.body}`);
				}
			})
			.then(res => {
				bar.increment();
				resolve(_usersRequestLoopHandling(token, idList, listPos, resBuffer, bar));
			})
			.catch(err => reject(err))
	})
}

module.exports.poolUsersRequest = poolUsersRequest;
module.exports.getAllPoolUsers = getAllPoolUsers;
module.exports.getAllUsers = getAllUsers;
