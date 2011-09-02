var fs = require( 'fs' );
var path = require('path');
var assert = require('assert');

//internal
var successes = 0, failures = 0, ignored = 0, totalFixtures = 0, fixturesRun = 0, completed = false;
var fixtures = {};

//options
var showSuccesses = false, suppressConsole = false, useColors = true, writeToConsole = true;
if (process.platform == 'win32') useColors = false;

var printlog = console.log;
var printerr = console.error;

var noderunner = module.exports = new (require("events").EventEmitter)();

var waiting = false;

noderunner.setup = function(config) {
	if (config.showSuccesses === true || config.showSuccesses === false)
		showSuccesses = !!config.showSuccesses;
	if (config.suppressConsole === true || config.suppressConsole === false)
		suppressConsole = !!config.suppressConsole;
	if (config.useColors === true || config.useColors === false)
		useColors = !!config.useColors;
	if (config.writeToConsole === true || config.writeToConsole === false)
		writeToConsole = !!config.writeToConsole;
	
	
	if (suppressConsole) {
		console.log = function(){};
		console.error = function(){};
	}
	return noderunner;
};

noderunner.reset = function() {
	successes = 0;
	failures = 0;
	ignored = 0;
	totalFixtures = 0;
	fixturesRun = 0;
	completed = false;
	fixtures = {};
	return noderunner;
}

noderunner.addDirectory = function(p) {
	waiting = true;
	fs.readdir(p, function( err, files ) {
		files.forEach(function(file) {
			var jsExt = /[.]js$/i;
			if (!file.match(jsExt)) return;
			var fixtureName = file.replace(jsExt,'');
			printlog('Loading tests: ' + fixtureName + " in " + path.join(p, file));
			noderunner.add(fixtureName, require(path.join(p, file)));
		});
		waiting = false;
		noderunner.emit('ready');
	});
	return noderunner;
}

noderunner.add = function (fixtureName, tests) {
	assert.ok('string' == typeof fixtureName, 'fixtureName should be a string');
	assert.ok('object' == typeof tests, 'tests must be an object');
	fixtures[fixtureName] = tests;
	noderunner.emit('addfixture', fixtureName, tests);
}

noderunner.addAll = function (fixs) {
	assert.ok('object' == typeof fixs, 'fixtures to add must be an object {key:tests}');
	for (var k in fixs) if (fixs.hasOwnProperty(k)) noderunner.add(k, fixs[k]);
}

var run = noderunner.run = function() {
	function gogogo() {
		var fixtureNames = [], i = 0;
		for (var k in fixtures) { fixtureNames.push(k); }
		totalFixtures = fixtureNames.length;
		
		(function proceed() {
			if (i >= fixtureNames.length) {
				complete();
				return;
			}
			var k = fixtureNames[i];
			++i;
			noderunner.emit('running', k);
			runOne(k, fixtures[k], function() {
				++fixturesRun;
				proceed();
			}, false);
		})();
	}
	
	if (!waiting)
		process.nextTick(function() { gogogo(); }); //allow event listeners to be bound after a chained .run()
	else
		noderunner.once('ready', gogogo);
	
	return noderunner;
}

function runOne (fixtureName, tests, callback, reportWhenDone) {
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
					noderunner.once('beforeComplete', async.complete);
				};
				async.complete = function(){
					if (async.isComplete) return; async.isComplete = true;
					try {
						async.myCallback();
						noderunner.emit('success', fixtureName, k);
					} catch (e) {
						noderunner.emit('failure', fixtureName, k, e);
					}
					teardown(function() { proceed(); });
				}
				
				try {
					var resp = tests[k](async);
					if (resp && resp['ignore']) {
						isAsync = false;
						noderunner.emit('ignore', fixtureName, k, resp['ignore'])
					} else {
						if (!isAsync) noderunner.emit('success', fixtureName, k);
					}
				} catch (e) {
					noderunner.emit('failure', fixtureName, k, e);
				}
				if (!isAsync) teardown(function() { teardown(proceed); });
			});
		})(k);
	});
}

function complete() {
	if (completed) return;
	completed = true;
	noderunner.emit('beforeComplete');
	
	var allran = totalFixtures == fixturesRun;
	var failed = failures || !allran;
	
	noderunner.emit('complete', {
		success: !failed,
		totalFixtures: totalFixtures,
		fixturesRun: fixturesRun,
		testsRun: (successes + failures + ignored),
		successes: successes,
		failures: failures,
		ignored: ignored
	});
	return !failed;
}

noderunner.on('complete', function(data) {
	if (writeToConsole)
		printlog('\n==========================================================================');
	
	var allran = data.totalFixtures == data.fixturesRun;
	
	if (writeToConsole) {
		(data.success ? printlog:printerr)('Tests ' + (data.success ? green('PASSED') : red('FAILED')) + ': ' + data.testsRun + ' tests run. ' + data.successes + ' succeeded, ' + data.failures + ' failed and ' + data.ignored + ' ignored' );
		if (!allran) printerr(red('FAILURE') + ': not all test fixtures completed! Only completed ' + data.fixturesRun + ' of ' + data.totalFixtures + '. Perhaps an async testmissed calling async.complete(), or a setup/teardown didn\'t call the callback');
	}
});

process.once('exit', function() {
	complete()
});

noderunner.on('running', function(test) {
	if (writeToConsole)
		printlog('\nRunning ' + test);
});

noderunner.on('addfixture', function(name, tests) {
	if (writeToConsole)
		printlog('Added fixture: "' + name + '"');
});

noderunner.on('failure', function(fixtureName, name, ex) {
	++failures;
	
	var stack = (ex.stack || "")
		.replace(/\n    /g, "\n        ")
		.replace(/(\s[(]).*(.{30}[.]js[:])/g, "$1.../$2");
	
	if (writeToConsole)
		printerr(red('    [FAILED]  ') + fixtureName + '=>"' + name + '" ::: ' + red(stack));
});

noderunner.on('success', function(fixtureName, name) {
	++successes;
	if (writeToConsole)
		if (showSuccesses) printlog(green('    [SUCCESS] ') + fixtureName + '=>"' + name + '"');
});

noderunner.on('ignore', function(fixtureName, name, reason) {
	++ignored;
	if (writeToConsole)
		printlog(yellow('    [IGNORE]  ') + fixtureName + '=>"' + name + '" Reason: ' + reason );
});

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