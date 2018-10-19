const Utils = require('./utils.js');
const Popsicle = require('popsicle');
const ClientOAuth = require('client-oauth2');
const fs = require('fs');


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
	return _getAllPoolUsers(token, params);
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
		console.log('waiting...')
		return Utils.sleep(1000, res);
	} else {
		return res;
	}
}

function _requestLoopHandling(res, token, params, currentPage) {
	if (currentPage === undefined) {
		currentPage = Math.ceil(res.headers['x-total'] / res.headers['x-per-page']);
		if (currentPage > 1) {
			return(_getAllPoolUsers(token, params, currentPage));
		} else {
			return true ;
		}
	} else if (currentPage > 1) {
		return(_getAllPoolUsers(token, params, --currentPage));
	} else {
		return true;
	}
}

function _getAllPoolUsers(token, params, currentPage) {
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
				//maybe here too?
				resolve(_requestLoopHandling(res, token, params, currentPage))
				//
			})
			.catch(err => reject(err))
	})
}

module.exports.poolUsersRequest = poolUsersRequest;
module.exports.getAllPoolUsers = getAllPoolUsers;
