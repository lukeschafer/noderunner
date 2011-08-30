var assert = require('assert');

module.exports = {
	//BOILERPLATE stuff. Fixture management
	fixtureSetup: function(done) {
		//if specified, this is called once when the fixture begins to run
		//use it to set up anything if it only needs to be done once per fixture, but for some reason can't be done on module load
		done(); //need to remember to call this
	},
	fixtureTeardown: function(done) {
		//if specified, this is called once when the fixture has finished running
		//use it to clean up the environment if you have changed it
		done(); //need to remember to call this
	},
	setup: function(done) {
		//if specified, this is called once for each test, before it is run
		//use it to setup anything used by more than one test that may be altered by a test
		done(); //need to remember to call this
	},
	teardown: function(done) {
		//if specified, this is called once for each test, after it is finised
		//use it to reset the fixture state if required
		done(); //need to remember to call this
	},
	
	"this is a test and it should succeed": function() {
		assert.ok(true);
	},
	
	"this is a broken test and it should fail with a custom message": function() {
		assert.ok(false, "woops!");
	},
	
	"this shouldn't be run, but we want it reported!": function() {
		return {ignore:"I don't want to run this right now"};
		
		assert(false, "don't run me!");
	},
	
	"this is an async test that passes!": function(async) {
		setTimeout(function() {
			async.complete();
		}, 1000);
		
		async(function() {
			assert.ok(true);
		});
	},
	
	"this is an async test that fails!": function(async) {
		setTimeout(function() {
			async.complete();
		}, 1000);
		
		async(function() {
			assert.ok(false);
		});
	},
	
	"if configured with suppressConsole, console writes shouldn't show": function() {
		console.log('yo');
	}
}