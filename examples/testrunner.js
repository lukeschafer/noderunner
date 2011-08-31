#!/usr/bin/env node
var noderunner = require('../index.js').setup({showSuccesses:true, suppressConsole:true}).runFromDir(require('path').resolve('./tests'));
