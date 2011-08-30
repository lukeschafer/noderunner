var fs = require( 'fs' );
var path = require('path');

var showSuccesses = false, successes = 0, failures = 0, totalFixtures = 0, fixturesRun = 0, suppressConsole = false, useColors = true;
if (process.platform == 'win32') useColors = false;

var printlog = console.log;
var printerr = console.error;

module.exports.setup = function(config) {
	showSuccesses = !!config.showSuccesses;
	suppressConsole = !!config.suppressConsole;
	
	if (suppressConsole) {
		console.log = function(){};
		console.error = function(){};
	}
	return module.exports;
}

module.exports.runFromDir = function(p) {
	var fixtures = {};
	fs.readdir(p, function( err, files ) {
		files.forEach(function(file) {
			var jsExt = /[.]js$/i;
			if (!file.match(jsExt)) return;
			var fixtureName = file.replace(jsExt,'');
			printlog('Loading tests: ' + fixtureName + " in " + path.join(p, file));
			fixtures[fixtureName] = require(path.join(p, file));
		});
		
		runAll(fixtures);
	});
}

var runAll = module.exports.runAll = function(fixtures) {
	var fixtureNames = [], i = 0;
	for (var k in fixtures) { fixtureNames.push(k); }
	totalFixtures = fixtureNames.length;
	
	(function proceed() {
		if (i >= fixtureNames.length) return;
		var k = fixtureNames[i];
		++i;
		printlog('\nRunning ' + k);
		run(k, fixtures[k], function() {
			++fixturesRun;
			proceed();
		});
	})();
}

var run = module.exports.run = function (fixtureName, tests, callback) {
	// remove cached modules so it's clean!
	var m = require('module');
	for (var k in m._cache) {
		if (k.indexOf('node_modules'))
		delete m._cache[k];
	}
	
	function placeholder(done) { done(); }
	var fixtureSetup = tests.fixtureSetup || placeholder;
	var fixtureTeardown = tests.fixtureTeardown || placeholder;
	var setup = tests.setup || placeholder;
	var teardown = tests.teardown || placeholder;
	
	var testNames = [], i = 0;
	for (var k in tests) { testNames.push(k); }
	
	fixtureSetup(function() {
		(function proceed(k) {
			if (i >= testNames.length) return fixtureTeardown(callback);
			var k = testNames[i];
			++i;
			
			if (k == 'fixtureSetup' || k == 'fixtureTeardown' || k == 'setup' || k == 'teardown') return proceed();
			
			setup(function() {
				var isAsync = false;
				function async(callback) {
					isAsync = true;
					async.isComplete = false;
					async.myCallback = callback;
					process.on('beforeExit', async.complete);
				};
				async.complete = function complete(){
					if (async.isComplete) return; async.isComplete = true;
					try {
						async.myCallback();
						success(fixtureName, k);
					} catch (e) {
						err(fixtureName, k, e);
					}
					teardown(function() { proceed(); });
				}
				
				try {
					var resp = tests[k](async);
					if (resp && resp['ignore']) {
						isAsync = false;
						ignore(fixtureName, k, resp['ignore'])
					} else {
						if (!isAsync) success(fixtureName, k);
					}
				} catch (e) {
					err(fixtureName, k, e);
				}
				if (!isAsync) teardown(function() { teardown(proceed); });
			});
		})(k);
	});
}

process.once('exit', function() {
	process.emit('beforeExit');
	printlog('\n==========================================================================');
	
	var allran = totalFixtures == fixturesRun;
	var failed = failures || !allran;
	
	(failed?printerr:printlog)('Tests ' + (failed?'\033[31mFAILED\033[0m: ':'\033[32mPASSED\033[0m: ') + (successes+failures) + ' tests run. ' + successes + ' succeeded and ' + failures + ' failed');
	if (!allran) printerr(' \033[31mFAILURE\033[0m: not all test fixtures completed! Only completed ' + fixturesRun + ' of ' + totalFixtures + '. Perhaps an async testmissed calling async.complete(), or a setup/teardown didn\'t call the callback');
	
	if (failed) process.exit(1);
});

function err(fixtureName, name, ex) {
	++failures;
	
	var stack = (ex.stack || "")
		.replace(/\n    /g, "\n        ")
		.replace(/(\s[(]).*(.{30}[.]js[:])/g, "$1.../$2");
	
	printerr(red('    [FAILED]  ') + fixtureName + '=>"' + name + '" ::: ' + red(stack));
}

function success(fixtureName, name) {
	++successes;
	if (showSuccesses) printlog(green('    [SUCCESS] ') + fixtureName + '=>"' + name + '"');
}

function ignore(fixtureName, name, reason) {
	++successes;
	printlog(yellow('    [IGNORE]  ') + fixtureName + '=>"' + name + '" Reason: ' + reason );
}

function red(str) {
	if (!useColors) return str;
	return '\033[31m' + str + '\033[0m';
}
function green(str){
	if (!useColors) return str;
	return '\033[32m' + str + '\033[0m';
}
function yellow(str) {
	if (!useColors) return str;
	return '\033[33m' + str + '\033[0m';
}