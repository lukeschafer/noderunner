# noderunner

  light weight test runner for node.js.
  
  noderunner was inspired by expresso, without being tied to posix systems. Like expresso, it has intuitive support for testing async code.
  
  It's worthwhile noting that all tests run in serial. This was a design choice made early on, as it makes handling fixtures simpler and more intuitive (following the principle of least surprise). I have been thinking of ways to support parallel tests without having them interfere, and I think I have a good idea, it'll just require a bit of playing around to get going. Stay tuned.
  
## What's it do?

  - run sync or async tests (in serial)
  - fixture setup/teardown and test setup/teardown
  - run tests individually or from a directory
  - support for 'ignore'
  - colored console output and options for console reporting (like not allowing other code to write to console)
  - test hooks for custom output/display. E.g. noderunner.on('failure' fn); 

## Coming

Planned features:

  - DONE! Test hooks for alternate/custom output/reporting
  - Code coverage
  - MAYBE custom asserts (building on existing asserts)

## Example

    require('noderunner')
        .setup({showSuccesses:true})
        .addDirectory(require('path').resolve('./tests'))
		.run();

    //in tests/test.js
    module.exports = {
        setup: function(done) {
            someDependency = require('someDependency').init();
            done();
        },
        "test that something happens": function() {
            assert.ok(true);
        },
        "test that something async happens": function(async) {
            setTimeout(function() {
                async.complete();
            }, 1000);
            async(function() {
                //this will be called to run the assertions once async.complete is called
                assert.ok(true);
            });
        }
    }
        
For more usage examples, check out the tests in examplestests/testfixture.js

## API

Config options (all are optional)

  - showSuccesses   : bool [default:false] Whether to log successful tests to console
  - suppressConsole : bool [default:false] Enables noderunner to override console.log and console.err so it doesn't clutter output
  - useColors       : bool [default:true]  Whether to color console ouput. Defaults false if platform == win32  
  - writeToConsole  : bool [default:true]  Should noderunner log success/failure messages to console? (set false only if you subscribe to the events)

Run all tests in a directory

    require('noderunner').addDirectory(require('path').resolve('./tests')).run();
    
Manually run one test

    require('noderunner').add('sometests', require('testfile.js')).run();
    
Manually run multiple tests

    require('noderunner').addAll({
        'tests1': require('tests1.js'),
        'tests2': require('tests2.js')
    }).run();

Mix 'n' match

    require('noderunner')
	.addDirectory(require('path').resolve('./tests'))
	.addAll({
        'tests1': require('tests1.js'),
        'tests2': require('tests2.js')
    })
	.add('sometests', require('testfile.js'))
	.run();
	
Add hooks for your own output/monitoring

    var noderunner = require('noderunner').addDirectory(dir).run();
	
	noderunner.on('addfixture', function(fixtureName, tests) {
		addToHtmlOutput('black', 'ADD', fixtureName, '', '');
	});
	noderunner.once('ready', function() {
		//running tests
	});
    noderunner.on('running', function(fixtureName) {
        addToHtmlOutput('black', 'RUNNING', fixtureName, '', '');
    });
    noderunner.on('failure', function(fixtureName, name, error) {
        addToHtmlOutput('red', 'FAILED', fixtureName, name, error.stack);
    });
    noderunner.on('success', function(fixtureName, name) {
        addToHtmlOutput('green', 'SUCCESS' fixtureName, name, 'completed');
    });
    noderunner.on('ignore', function(fixtureName, name, reason) {
        addToHtmlOutput('yellow', 'IGNORED', fixtureName, name, reason);
    });
    noderunner.on('complete', function(state) {
        /* state contains: {
			success: BOOL,
			totalFixtures: NUMBER,
			fixturesRun: NUMBER, //if fixturesRun != totalFixtures then success will be false - something's wrong
			testsRun: NUMBER, //successes + failures + ignored
			successes: NUMBER,
			failures: NUMBER,
			ignored: NUMBER
		}
    });

## License: The MIT License

Copyright (c) 2011 Luke Schafer

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
