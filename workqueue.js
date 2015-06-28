function WorkQueue(queueRef, processingCallback) {
	this.processingCallback = processingCallback;
	this.busy = false;
	this.queueRef = queueRef;

	this.nextItem();

	var self = this;

//	listen for any new jobs that are added to the queue and process...
	this.queueRef.on("added", function(data) {
		var data = data.value();
		self.currentItem = data;
		self.tryToProcess();
	}, this);
}

WorkQueue.prototype.nextItem = function() {
	var self = this;
//	grab any existing jobs that have not yet been claimed...
//	You can use get() or on('value') for this, both are included to demo...
	this.queueRef.limit(1).on('value', function (response) {
		if ( response.count() ){
			response.forEach( function( data ){
				self.currentItem = data.value();
				self.tryToProcess();
			});
		}else{
			console.log( "no jobs in queue" );
		}
	}, this);
}

WorkQueue.prototype.readyToProcess = function() {
	this.busy = false;
	this.nextItem();
	this.tryToProcess();
}

WorkQueue.prototype.tryToProcess = function() {
	if(!this.busy && this.currentItem) {
		this.busy = true;
		var dataToProcess = null;
		var self = this;
		var theItem = this.currentItem;
		this.currentItem = null;

		if (theItem && !theItem.status) {
			theItem.status = "processing";
			theItem.statusChanged = "Flybase.ServerValue.TIMESTAMP";
			self.queueRef.updateId(theItem._id,theItem);
			console.log("Claimed a job.");
			var dataToProcess = theItem;
			self.processingCallback(dataToProcess, function( TheItem, error ) {
				if( typeof(error) !== 'undefined' ){
					theItem.status = "error";
					theItem.errorMessage = error;
					theItem.statusChanged = "Flybase.ServerValue.TIMESTAMP";
					self.queueRef.updateId(theItem._id,theItem);
				}else{
					console.log("job finished");
					//	The job has finished so delete it from the queue...
					self.queueRef.deleteId( theItem._id );
				}
				//	start over and grab the next job...
				self.readyToProcess();
			});
		}else{
			if( theItem.status ){
				console.log("Another worker beat me to the job.");
				self.readyToProcess();
				return;				
			}
		}
	}
}

module.exports = WorkQueue;
