#!/usr/bin/env node
require('../index.js').setup({showSuccesses:true, suppressConsole:true}).runFromDir(require('path').resolve('./tests'));