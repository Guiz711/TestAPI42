const ClientOAuth = require('client-oauth2');
const Utils = require('./src/utils.js');
const API42 = require('./src/apiRequests.js');
const Credentials = require('./resources/credentials.json');

let Auth42 = new ClientOAuth({
	clientId: Credentials.Id,
	clientSecret: Credentials.Secret,
	accessTokenUri: 'https://api.intra.42.fr/oauth/token',
	authorizationUri: 'https://api.intra.42.fr/oauth/authorize',
	redirectUri : 'http://www.testAPI42.fr/'
});

Auth42.credentials.getToken()
	.then(token => {
		return API42.getAllPoolUsers(token, {
			poolYear: '2018',
			poolMonth: 'july',
			campus: 'Paris',
			pageSize: 100});
		// return API42.getAllUsers(token, './results/2018_july_pool/users_1.json');
	})
	.catch(err => {
		console.error(err);
	});

function asyncReq(token, params) {
	API42.poolUsersRequest(token, params)
	.then(res => {
		console.log(res);
	})
	.catch(err => console.error(err))
}