var api_key = "YOUR-API-KEY";
var db = "sample";
var collection = "workqueue";
var newWorkPeriod = 700;

var WorkQueue = require("./workqueue.js");
var itemsRef = require('flybase').init(db, collection, api_key);

var workCallback = function(data, whenFinished) {
	//This is where we actually process the data. We need to call "whenFinished" when we're done
	//to let the queue know we're ready to handle a new job.
	console.log("Started Processing: " + data.number);
	
	//This demo task simply pauses for the amount of time specified in data.time
	setTimeout(function() {
		console.log("Finished Processing: " + data.number + " for " + data.time + " milliseconds");
		//	when the job finishes, call back to the function identified in whenFinished and pass the data object.
		whenFinished( data );
	}, data.time);
}

workerqueue = new WorkQueue(itemsRef, workCallback);
