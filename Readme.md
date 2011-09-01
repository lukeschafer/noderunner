# noderunner

  light weight test runner for node.js.
  
  noderunner was inspired by expresso, without being tied to posix systems. Like expresso, it has intuitive support for testing async code.
  
  It's worthwhile noting that all tests run in serial. This was a design choice made early on, as it makes handling fixtures simpler and more intuitive (following the principle of least surprise). If you have a good use case against it (likely), or figure out a way to work it in without changing everything else (unlikely) let me know, or push it up :).
  
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
        .runFromDir(require('path').resolve('./tests'));

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

    require('noderunner').runFromDir(require('path').resolve('./tests'));
    
Manually run one test

    require('noderunner').run(require('testfile.js'));
    
Manually run multiple tests

    require('noderunner').runAll({
        'tests1': require('tests1.js'),
        'tests2': require('tests2.js')
    });

Add hooks for your own output/monitoring

    var noderunner = require('noderunner').runAllFromDir(dir);
    noderunner.on('failure', function(fixtureName, name, error) {
        addToHtmlOutput('red', 'FAILED', fixtureName, name, error.stack);
    }
    noderunner.on('success', function(fixtureName, name) {
        addToHtmlOutput('green', 'SUCCESS' fixtureName, name, 'completed');
    }
    noderunner.on('ignore', function(fixtureName, name, reason) {
        addToHtmlOutput('yellow', 'IGNORED', fixtureName, name, reason);
    }

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
