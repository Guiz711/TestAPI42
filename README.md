# TestAPI42

This tool helps you to make requests to the 42 school API.
It allows you to retrieve the public profiles of the user who attemted a specific pool.

## Getting Started

### Prerequisites

- node
- credentials for the 42 API

### Installing

1. Install the node modules dependencies with npm with the following command line :

```
npm install
```

2. create a file with your API id and secret named "credentials.json" into the resources/ folder

```
{
	"Id" : "myId",
	"Secret" : "mySecret"
}
```

## Usage

Use the following command to run the script:

```
npm start
```

First you will need to get all the users who attempted a pool. Then you can use this list to retrieve their public profiles.

### Pool Users List

Choose the "Pool" mode, it will ask you some informations.

Pool Year: the year of the pool  
Pool Month: the month of the pool  
Page Size: the number of users per page (from 1 to 100)

```
TestAPI42: (P) = pool users request; (U) = users profiles request:  P
TestAPI42 Pool: Pool Year:  2016
TestAPI42 Pool: Pool Month:  september
TestAPI42 Pool: Results Per Page (up to 100):  50
progress [========================================] 100% | ETA: 0s | 16/16
```

### Users Profiles

Once you have used the first method you can process the result files to retrieve the corresponding users profiles.
Choose the "Users" mode, it will ask you the link to one of the list files.

```
TestAPI42: (P) = pool users request; (U) = users profiles request:  U
TestAPI42 User: Enter the users list filepath:  ./results/2017_july_pool/users_1.json
progress [========================================] 100% | ETA: 0s | 50/50
```
