
# noderunner

  simple test runner for node.js
  
## What's it do?

  - run sync or async tests
  - fixture setup/teardown and test setup/teardown
  - run tests individually or from a directory
  - support for 'ignore'
  - colored console output and options for console reporting
  
## Coming

Planned features:

  - Test hooks for alternate/custom output/reporting
  - Code coverage

## Example

    require('noderunner')
        .setup({showSuccesses:true})
        .runFromDir(require('path').resolve('./tests'));

## API

Config options (all are optional)

  - showSuccesses   : bool [default:false] Whether to log successful tests to console
  - suppressConsole : bool [default:false] Enables noderunner to override console.log and console.err so it doesn't clutter output
  - useColors       : bool [default:true]  Whether to color console ouput. Defaults false if platform == win32  

Run all tests in a directory

    require('noderunner').runFromDir(require('path').resolve('./tests'));
	
Manually run one test

    require('noderunner').run(require('testfile.js'));
	
Manually run multiple tests

    require('noderunner').runAll({
        'tests1': require('tests1.js'),
        'tests2': require('tests2.js')
    });
  
For more usage examples, check out the tests in examplestests/testfixture.js

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
