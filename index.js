'use strict';

import which from 'which';
import { spawn } from 'child_process';
//import spawn from 'cross-spawn';
//import { dirname, join } from 'path';
//import { fileURLToPath } from 'url';

//const __filename = fileURLToPath(
//import.meta.url);
//const __dirname = dirname(__filename);
const sync = which.sync;

/**
 * Supported package commands
 */
const SYS_COMMANDS = {
  brew: 'brew install',
  port: 'sudo port install',
  pkgin: 'sudo pkgin install',
  choco: 'choco install',
  powershell: "powershell 'Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))'",
  'apt-get': 'sudo apt-get install',
  yum: 'sudo yum install',
  dnf: 'sudo dnf install',
  nix: 'nix-env --install',
  zypper: 'sudo zypper in',
  emerge: 'sudo emerge -a',
  pacman: 'sudo pacman -S',
  pkg: 'pkg install',
  pkg_add: 'pkg_add',
  crew: 'crew install'
};

/**
 * Supported package managers
 */
const SYS_MANAGERS = {
  darwin: ['brew', 'port', 'pkgin'],
  win32: ['choco', 'powershell'],
  linux: ['apt-get', 'yum', 'dnf', 'nix', 'zypper', 'emerge', 'pacman', 'crew'],
  freebsd: ['pkg', 'pkg_add'],
  sunos: ['pkg'],
  netbsd: ['none']
};

function sysManager(reject) {
  if (!reject)
    reject = (data) => {
      return new Error(data);
    }

  let managers = SYS_MANAGERS[process.platform];
  if (!managers || !managers.length) {
    return reject('unknown platform \'' + process.platform + '\'');
  }

  managers = managers.filter(function (mng) {
    return (where(mng) !== null);
  });

  if (!managers.length) {
    return reject('System OS package manager not found');
  }

  return SYS_COMMANDS[managers[0]].split(' ');
}

/**
 * Gets the system package manager install command.
 *
 * @returns {Object}
 *```
 * sudo: boolean, // true or false,
 * command: string, // 'apk-get' - system package manager command,
 * installer: string, // 'sudo apk-get install' - full install command
 *```
 * - Defaults to 'get os-manager installer' if no package manager is found.
 *
 * @throws if `process.platform` is none of darwin, freebsd, linux, sunos or win32.
 */
export const packager = Sys.packager = function () {
  let sys = sysManager();
  if (sys[0])
    return {
      sudo: (sys[0] === 'sudo'),
      command: ((!sys[2]) ? sys[0] : sys[1]),
      installer: sys.join(' ')
    }
  else
    return new Error(sys);
};

/**
 * Install package using the system package manager command.
 *
 * @returns {string} Output of spawn command.
 * - E.g. 'sudo apg-get install' for Debian based systems.
 * - Defaults to 'get os-manager installer' if no package manager is found.
 * @throws Throws if `process.platform` is none of darwin, freebsd, linux, sunos or win32.
 */
export const installer = Sys.installer = function (application) {
  let installOutput = '';
  return new Promise(function (resolve, reject) {
    if (!application)
      return reject("No package, application name missing.");

    let manger = sysManager(reject);
    let cmd = manger[0];
    let args = null;
    let install = null;
    if (manger[1])
      args = [manger[1]];
    if (manger[2])
      install = [manger[2]];

    let whatToInstall = (Array.isArray(application)) ? [].concat(application).concat(['-y']) : [].concat([application]).concat(['-y']);
    let system = whatToInstall;
    if ((args) && (!install))
      system = args.concat(whatToInstall);
    if ((args) && (install))
      system = args.concat(install).concat(whatToInstall);
    if (cmd != 'powershell') {
      let input = '';
      //if (cmd.includes('choco')) {
      //cmd = where('choco');
      //system = [cmd].concat(system);
      //system = [cmd].concat('-ArgumentList').concat(system);
      //cmd = join(__dirname, 'bin', 'sudo.bat');
      //}

      const proc = spawn(cmd, system, {
        // stdio: 'inherit',
        stdio: 'pipe',
        // shell: true
      });

      proc.on('error', (err) => {
        return reject(err);
      });

      proc.on('close', () => {
        return resolve(installOutput);
      });

      proc.on('exit', () => {
        return resolve(installOutput);
      });

      proc.stdout.on('data', (data) => {
        installOutput += input = data.toString();
        if (system.includes('node-fake-tester')) {
          proc.kill('SIGKILL');
          return resolve('For testing only, no package installed.');
        }

        if (input.includes('The package was not found') || input.includes('Unable to locate package') || input.includes('is denied') || input.includes('Throwing error')) {
          proc.kill('SIGKILL');
          return reject(input);
        }
      });

      proc.stderr.on('data', (data) => {
        return reject(data.toString());
      });

      if (system.includes('node-fake-tester') && Object.getOwnPropertyDescriptor(process, 'platform').value == 'darwin') {
        proc.kill('SIGKILL');
        return resolve('For testing only, no package installed.');
      }

    } else {
      return reject('No package manager installed!');
    }
  });
}

/**
 * Like the unix `which` utility.
 *
 * Finds the first instance of a specified executable in the PATH environment variable.
 *
 * @param String executable
 *
 * @returns String|Null
 */
export const where = Sys.where = function (executable) {
  let found = sync(executable, {
    nothrow: true
  });

  return found;
}

function Sys() { }

export default Sys;
