'use strict';

var express = require('express');
var routes = require('./controllers/getAndUpdateData.js');
var mssqlAtt = require('./controllers/mssqlatt.js');
var mongo = require('mongodb').MongoClient;

var app = express();
  

mongo.connect('mongodb://dntq:onlineDemo123@ds153735.mlab.com:53735/heroku_wk3wk5bm', function (err, db) {

	if (err) {
		throw new Error('Database failed to connect!');
	} else {
		console.log('MongoDB successfully connected on port 27017.');
	}

	app.use('/controllers', express.static(process.cwd() + '/controllers'));

	routes(app, db, mssqlAtt);
	
	var port = process.env.PORT || 8080;//3000;
	app.listen(port, function () {
		console.log('Node.js listening on port ' + port + '...');
	});

});

