#!/usr/bin/env node

import {
  packager, installer, where,
  spawning, isNull, isMac, isWindows
} from '../index.js';
import minimist from 'minimist';
import {
  createRequire
} from 'module';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
  import.meta.url);
const __dirname = dirname(__filename);

const require = createRequire(
  import.meta.url);
const pack = require('../package.json');

const CMD = {
  win32: join(__dirname, 'sudo.bat'),
  darwin: 'sudo osascript'
};
const SYSTEM = {
  win32: join(__dirname, 'installChocolatey.cmd'),
  darwin: join(__dirname, 'xcode-brew-install.scpt')
};

/*
 * Arguments.
 */
let argv = minimist(process.argv.slice(2));

/*
 * Command.
 */
var command = Object.keys(pack.bin)[0];

/**
 * Help.
 *
 * @return {string}
 */
function help() {
  return [
    'Universal package installer.',
    'Usage: ' + command + ' package [options]',
    '',
    pack.description,
    '',
    ' [package]  - Software/application to install.',
    '',
    'Options:',
    '',
    '  -h, --help       Output usage information.',
    '  -v, --version    Output version number.',
    '  -g, --get        Get and install an platform package manger, on `macOS` - brew, on `Windows` - chocolaty.',
    '',
    'Example:',
    '> ' + command + ' nano',
    ''
  ].join('\n ') + '\n';
}

/*
 * Program.
 */
if (argv.help || argv.h) {
  console.log(help());
} else if (argv.version || argv.v) {
  console.log(pack.version);
} else if ((argv.get || argv.g)
  && ((isMac() && isNull(where('brew')))
    || (isWindows() && isNull(where('choco'))))
) {
  spawning(CMD[process.platform], [SYSTEM[process.platform]])
    .then(function () {
      console.log('Finish!')
    })
    .catch(function (err) {
      console.error(err);
    })
} else if (argv) {
  let args = argv._;
  let packages = args.shift();
  if (packages) {
    console.log("Installing...");
    packages = (args == '') ? packages : [packages].concat(args);
    installer(packages)
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.error(err);
      });
  } else {
    console.log(packager().installer);
  }
} else {
  console.log(help());
}
