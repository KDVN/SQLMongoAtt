'use strict';

var dateFormat = require("dateformat");
var mr = require('moment-timezone');
// var path = process.cwd();
// var AtendanceHandler = require(path + '/app/controllers/attendanceHandler.server.js');

module.exports = function (app, db, mssqlatt) {
	
	var dbAttendances = db.collection('dbAttendances');

	dbAttendances.findOne({},{}, function (err, result) 
	{
		if (!result)
			getAndUpdateData()
	});
	// Update SQL to MongoDB
	function getAndUpdateData(cb) {
			var mssqlattData = new mssqlatt().getData(function (MSSQLresult, err) {
		    if (!err) 
		    	if (MSSQLresult.length > 0) {
		    				console.log("Getting");
							var result = MSSQLresult;
							var fullData = {};
							for (var intCount = 0, len = result.length; intCount < len; intCount++) {
								var currentRecord = result[intCount]
								var key = "" + currentRecord.Month + currentRecord.year
								if (!isNaN(currentRecord.year))
									if (key in fullData)
										fullData[key].push([currentRecord.MaNV, dateFormat(currentRecord.Ngay, "yyyy-mmm-dd"), currentRecord.Gio, currentRecord.MayChamCong, currentRecord.Month, currentRecord.year.toString()])
									else
										fullData[key]=[[currentRecord.MaNV, dateFormat(currentRecord.Ngay,"yyyy-mmm-dd"), currentRecord.Gio, currentRecord.MayChamCong, currentRecord.Month, currentRecord.year.toString()]]
							}
							Object.keys(fullData).forEach(function (key) {
							// for (var intCount = 0, len = fullData.length; intCount < len; intCount++) {
								var currentRecord = fullData[key];
								dbAttendances.findOneAndReplace({ "key" : key },
																  { "key": key,
																  "data": currentRecord,
																  updatedOn: mr().tz('Asia/HO_CHI_MINH').format()
																  },
																  { upsert : true, returnNewDocument: true },
																  function (err, res) {
																	console.log("Inserted To Database " + res);
																	console.log("On: "+ mr().tz('Asia/HO_CHI_MINH').format());
																	cb;
																  });
							});
		    		
		    	}
		    else
		    	console.log(err)
		});
	}
	    
	
	
	app.route('/updated').get(function(req, res){
		dbAttendances.find({},{key:1, _id: 0}).each(function (err, result){
			if (err) throw err; 
			console.log(result);
		});
		res.send("Updated Is OK")
	});
	
	app.route('/forceupdate').get(function(req, res){
		console.dir(req.query.filter);
		res.send(JSON.stringify(req.query.filter));
		getAndUpdateData(function () {
		 	res.send("Updated Is OK");
		 }, req.query.filter);
	});
	
	app.route('/')
		.get(function (req, res) {
			res.send("Hello World"); //, )
		});

	app.route('/api/getMonths')
		.get(function(req, res) {
			var resMonths = [];
			var results = dbAttendances.find({},{key: 1, _id: 0}).each(function (err, result){
				if (err) throw err;
				
				if (result===null)
				 	{
				 		//console.log(resMonths);
				 		resMonths.sort(function(a, b){
				 			var date1 = new Date(Date.parse(a.split("-")[0] +" 1, " + a.split("-")[1]));
				 			var date2 = new Date(Date.parse(b.split("-")[0] +" 1, " + b.split("-")[1]));
				 			return date2-date1;
				 		});
						res.json(resMonths);
				 	}
				else
					if ('key' in result)
					{
					var rkey = result.key;
				 	var rMonth = rkey.substring( 0, rkey.length - 4);
				 	var rYear = rkey.substring( rkey.length - 4, result.key.length);
				 	resMonths.push(rMonth + "-" + rYear)
					}
			});
			
			
		});
	var getDataInterval = 120 * 60 * 1000;
	
	//Update data
	setInterval(function () {
		getAndUpdateData()
	}, getDataInterval);
};