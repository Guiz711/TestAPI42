const ClientOAuth = require('client-oauth2');
const Utils = require('./src/utils.js');
const API42 = require('./src/apiRequests.js');
const Credentials = require('./resources/credentials.json');
const fs = require('fs');
// const Save = require('./save.json');

let Auth42 = new ClientOAuth({
	clientId: Credentials.Id,
	clientSecret: Credentials.Secret,
	accessTokenUri: 'https://api.intra.42.fr/oauth/token',
	authorizationUri: 'https://api.intra.42.fr/oauth/authorize',
	redirectUri : 'http://www.testAPI42.fr/'
});

Auth42.credentials.getToken()
	.then(token => {
		return getAllPoolUsers(token, {
			poolYear: 2018,
			poolMonth: 'august',
			campus: 'Paris',
			pageSize: 100});
	})
	.catch(err => {
		console.error(err);
	});

function getAllPoolUsers(token, params) {
	return _getAllPoolUsers(token, params);
}

function _getAllPoolUsers(token, params, currentPage) {
	if(currentPage !== undefined)
		params.pageNumber = currentPage;
	else
		params.pageNumber = 1;

	return new Promise((resolve, reject) => {
		API42.poolUsersRequest(token, params)
			.then(res => {
				if (res.status == 429) {
					reject("Rate Limit Exceeded");
				} else if (res.status == 200) {
					//maybe here too?
					let dir = `${params.poolYear}_${params.poolMonth}`;
					if (!fs.existsSync(`./Results/${dir}`))
						fs.mkdirSync(`./Results/${dir}`);
					let fileName = `users_${currentPage !== undefined ? currentPage : 1}`;
					Utils.writeFilePromise(`./Results/${dir}/${fileName}.json`, res.body)
						.catch(err => console.error(err));
					//

					//need factorisation in new function
					if (res.headers['x-hourly-ratelimit-remaining'] == 0) {
						reject("Hourly Rate Limit Exceeded");
					} else if (res.headers['x-secondly-ratelimit-remaining'] == 0) {
						return Utils.sleep(1000);
					} else {
						return;
					}
					//
				} else {
					reject(`API response error: ${res.body}`);
				}
			})
			.then(() => {
				//maybe here too?
				if (currentPage === undefined) {
					currentPage = res.headers['x-total'] / res.headers['x-per-page'];
					if (currentPage > 1) {
						resolve(getAllPoolUser(token, params, currentPage));
					} else {
						resolve(true);
					}
				} else if (currentPage > 1) {
					resolve(getAllPoolUser(token, params, --currentPage));
				} else {
					resolve(true);
				}
				//
			})
			.catch(err => reject(err))
	})
}

function asyncReq(token, params) {
	API42.poolUsersRequest(token, params)
	.then(res => {
		console.log(res);
	})
	.catch(err => console.error(err))
}