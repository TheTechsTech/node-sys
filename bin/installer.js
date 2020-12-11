#!/usr/bin/env node

import { packager, installer, where } from 'node-sys';
import minimist from 'minimist';
import {
  createRequire
} from 'module';
import PowerShell from 'powershell';


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
    '  -h, --help       Output usage information.',
    '  -v, --version    Output version number.',
    '  -g, --get        Get ad install an platform package manger, on `macOS` - brew, on `Windows` - chocolaty.',
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
} else if ((argv.get || argv.g) && process.platform == 'win32' && where('choco') == null) {
  console.log('Download and Install Chocolatey');
  const ps = new PowerShell("Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))", {
    executionpolicy: 'Unrestricted'
  });

  ps.on('error', (err) => {
    return new Error(err);
  });
  ps.on('output', (data) => console.log(data));
  ps.on('error-output', (data) => {
    return new Error(data);
  });

  ps.on('end', () => {
    console.log('Chocolatey Installed');
    return;
  });
} else if ((argv.get || argv.g) && process.platform == 'darwin' && where('brew') == null) {
  let installOutput = '';
  const child = spawn(cmd, {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
  });

  child.on('close', () => {
  });

  child.on('exit', () => {
  });

  child.stdout.on('data', (data) => {
    installOutput += data.toString();
  });

  child.stderr.on('data', (data) => {
    return new Error(data.toString());
  });
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
    console.log(packager().installer);
  }
} else {
  console.log(help());
}
