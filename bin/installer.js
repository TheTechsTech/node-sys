#!/usr/bin/env node

import { packager, installer, where } from '../index.js';
import minimist from 'minimist';
import {
  createRequire
} from 'module';
import PowerShell from 'powershell';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
  import.meta.url);
const __dirname = dirname(__filename);

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
  let args = join(__dirname, 'xcode-brew-install.scpt');
  const child = spawn('osascript', [args], {
    stdio: 'pipe'
  });

  child.on('error', (err) => {
    console.error(err);
  });

  child.on('close', () => {
    console.log(installOutput);
  });

  child.on('exit', () => {
    console.log(installOutput);
  });

  child.stdout.on('data', (data) => {
    installOutput += data.toString();
  });

  child.stderr.on('data', (data) => {
    return new Error(data.toString());
  });
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
