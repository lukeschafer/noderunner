#!/usr/bin/env node
var noderunner = require('../index.js').setup({showSuccesses:true, suppressConsole:false}).addDirectory(require('path').resolve('./tests')).run();
