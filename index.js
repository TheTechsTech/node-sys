'use strict';

import which from 'which';
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
  import.meta.url);
const __dirname = dirname(__filename);
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
  netbsd: ['none'],
  win64: ['choco'],
  shell: ['powershell'],
};

function sysManager() {
  let managers = SYS_MANAGERS[process.platform];
  if (!managers || !managers.length) {
    return 'unknown platform \'' + process.platform + '\'';
  }

  managers = managers.filter(function (mng) {
    return (where(mng) !== null);
  });

  if (!managers.length) {
    return 'System OS package manager not found';
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
  if (Array.isArray(sys) && sys[0])
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
export const installer = Sys.installer = function (application, progress = () => { }) {
  if (!application)
    return new Promise((resolve, reject) => { return reject("No package, application name missing."); });

  let manager = sysManager();
  if (!Array.isArray(manager))
    return new Promise((resolve, reject) => { return reject(manager); });
  let cmd = manager[0];
  let args = null;
  let install = null;
  if (manager[1])
    args = [manager[1]];
  if (manager[2])
    install = [manager[2]];

  let whatToInstall = (Array.isArray(application)) ? [].concat(application).concat(['-y']) : [].concat([application]).concat(['-y']);
  let system = whatToInstall;
  if ((args) && (!install))
    system = args.concat(whatToInstall);
  if ((args) && (install))
    system = args.concat(install).concat(whatToInstall);

  if (cmd != 'powershell') {
    if (cmd.includes('choco') && process.platform == 'win32') {
      cmd = where('choco');
      system = [cmd].concat(system);
      cmd = join(__dirname, 'bin', 'sudo.bat');
    }

    return spawning(cmd, system, progress);
  } else {
    return new Promise((resolve, reject) => { return reject('No package manager installed!') });
  }
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

/**
 * Spawn subprocess with `Promise` features, and `progress` callback for `on('data') `event.
 *
 * @param {String} cmd - platform command
 * @param {Array} argument - command arguments
 * @param {Function} progress - callback for `on('data')` event.
 *```js
 * { handle: object, output: string }
 *```
 * - the callback will received object, `instance` **handle** of the spawned child processes, and any **output** data.
 * - any returns will be the **`resolve()` .then()** handler.
 * @param {Object} options - Any child process `spawn` options, defaults: stdio: 'pipe'.
 */
export const spawning = Sys.spawning = function (cmd, argument = [], progress = () => { }, options = { stdio: 'pipe', }) {
  return new Promise((resolve, reject) => {
    let output = null;
    const child = spawn(cmd, argument, options);
    child.on('error', (data) => {
      return reject(data);
    });

    child.on('close', () => {
      return resolve(output);
    });

    child.on('exit', () => {
      return resolve(output);
    });

    child.stdout.on('data', (data) => {
      let input = data.toString();
      let onProgress = null
      try {
        if (progress) {
          onProgress = progress({ handle: child, output: input });
        }
      } catch (e) {
        return reject(e.toString());
      }

      if (onProgress && onProgress != null) {
        output = onProgress;
      } else if (input != null) {
        output += input;
      }

      if (argument.includes('fake-js')) {
        child.kill('SIGKILL');
        return resolve('For testing only. ' + output);
      }
    });

    child.stderr.on('data', (data) => {
      return reject(data.toString());
    });

    if (argument.includes('fake-js') && Object.getOwnPropertyDescriptor(process, 'platform').value == 'darwin') {
      child.kill('SIGKILL');
      return resolve('For testing only. ' + output);
    }
  });
}

function Sys() { }

export default Sys;
