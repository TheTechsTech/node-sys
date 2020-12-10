#!/usr/bin/env node

import { packager, installer } from 'node-sys';
import minimist from 'minimist';
import {
  createRequire
} from 'module';

const require = createRequire(
  import.meta.url);
const pack = require('../package.json');

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
    '  -h, --help       output usage information',
    '  -v, --version    output version number',
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
} else if (argv) {
  let arguments = argv._;
  let package = arguments.shift();
  if (package) {
    console.log("Installing...");
    installer(package)
      .then(function (data) {
        //
      })
      .catch(function (err) {
        //
      });
  } else {
    console.log(packager().command);
  }
} else {
  console.log(help());
}


/*
if (process.platform == 'win32' && cmd == 'powershell') {
  const PowerShell = require("powershell");
  console.log('Download and Install Chocolatey');
  const ps = new PowerShell("Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))", {
    executionpolicy: 'Unrestricted'
  });

  ps.on('error', (err) => {
    return reject(err);
  });
  ps.on('output', (data) => console.log(data));
  ps.on('error-output', (data) => {
    return reject(data);
  });

  ps.on('end', () => {
    console.log('Running choco install ' + whatToInstall);
    const spawn = child_process.spawn('choco', ['install'].concat(whatToInstall), {
      stdio: 'pipe'
    });

    spawn.on('error', (err) => {
      return reject(err);
    });
    spawn.on('close', (code) => {
      return resolve(code);
    });
    spawn.on('exit', (code) => {
      return resolve(code);
    });

    spawn.stdout.on('data', (data) => console.log(data.toString()));
    spawn.stderr.on('data', (data) => {
      return reject(data.toString());
    });
  });
}



*/
