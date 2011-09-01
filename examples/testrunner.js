#!/usr/bin/env node
var noderunner = require('../index.js').setup({showSuccesses:true, suppressConsole:true}).addDirectory(require('path').resolve('./tests')).run();
