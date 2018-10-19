const Utils = require('./utils.js');
const Popsicle = require('popsicle');
const ClientOAuth = require('client-oauth2');

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

module.exports.poolUsersRequest = poolUsersRequest;