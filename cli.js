#!/usr/bin/env node

const pkgDesc = require('./package.json')
const commandAlias = Object.keys(pkgDesc.bin).filter(key => pkgDesc.bin[key] === './cli.js')[0]
var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
  addHelp: true,
  version: pkgDesc.version,
  description: pkgDesc.description
});
parser.addArgument(
  [ '-t', '--tag' ],
  {
    help: 'Use only tagged commits to mark version changes',
    action: 'storeTrue',
    dest: 'useTags'
  }
);

const args = parser.parseArgs();

const createChangelog = require('./');
createChangelog(args);
