var api_key = "YOUR-API-KEY";
var db = "sample";
var collection = "workqueue";
var newWorkPeriod = 700;

var workItems = require('flybase').init(db, collection, api_key);

var i = 0;
setInterval(function() {
	console.log( "Creating job: " + i );
	workItems.push({number: i, time: Math.floor(Math.random()*2000)});
	i++;
}, newWorkPeriod);
