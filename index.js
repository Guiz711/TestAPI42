const ClientOAuth = require('client-oauth2');
const API42 = require('./src/apiRequests.js');
const Credentials = require('./resources/credentials.json');
const prompt = require('prompt');
const colors = require('colors/safe');

prompt.start();

prompt.message = colors.green('TestAPI42');
prompt.delimiter = ': ';

const mode = {
	description: '(P) = pool users request; (U) = users profiles request',
	type: 'string',
	pattern: /^\(?[UuPp]\)?$/,
	message: 'Choose a mode between U and P',
	required: true
};

const pool = {
	properties: {
		poolYear: {
			description: 'Pool Year',
			type: 'string',
			pattern: /^20[1-9][0-9]$/,
			message: 'Please choose a valid year',
			required: false
		},
		poolMonth: {
			description: 'Pool Month',
			type: 'string',
			pattern: /^(january|february|march|april|may|june|july|august|september|october|november|december)$/gmi,
			message: 'Please choose a valid month',
			required: false
		},
		pageSize: {
			description: 'Results Per Page (up to 100)',
			type: 'number',
			minimum: 1,
			maximum: 100,
			message: 'Please enter a number between 1 and 100',
			required: false
		}
	}
};

const user = {
	properties: {
		filepath: {
			description: 'Enter the users list filepath',
			type: 'string',
			required: true
		}
	}
};

prompt.get(mode, (err, res) => {
	if(err) {
		console.error(err);
	}
	res.question = res.question.replace(/[\(\)]/g, '');
	res.question = res.question.toLowerCase();
	if(res.question === 'p') {
		prompt.message = colors.green('TestAPI42 Pool');
		prompt.get(pool, (err, res) => {
			if(err) {
				console.error(err);
			}
			makeAPIRequest(res, API42.getAllPoolUsers);
		});
	} else if(res.question === 'u') {
		prompt.message = colors.green('TestAPI42 User');
		prompt.get(user, (err, res) => {
			if(err) {
				console.error(err);
			}
			makeAPIRequest(res.filepath, API42.getAllUsers);
		});
	}
})

function makeAPIRequest(params, requestFunction)
{
	let Auth42 = new ClientOAuth({
		clientId: Credentials.Id,
		clientSecret: Credentials.Secret,
		accessTokenUri: 'https://api.intra.42.fr/oauth/token',
		authorizationUri: 'https://api.intra.42.fr/oauth/authorize',
		redirectUri : 'http://www.testAPI42.fr/'
	});

	Auth42.credentials.getToken()
		.then(token => {
			return requestFunction(token, params);
			// return API42.getAllPoolUsers(token, {
			// 	poolYear: '2018',
			// 	poolMonth: 'july',
			// 	campus: 'Paris',
			// 	pageSize: 100});
			// return API42.getAllUsers(token, './results/2018_july_pool/users_1.json');
		})
		.catch(err => {
			console.error(err);
		});
}
