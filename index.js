'use strict';

import which from 'which';
import { spawn, fork } from 'child_process';
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
 * @param {String|Array} application package to install.
 * @param {Function} progress callback for any output doing installation.
 * - Any value returned in `callback` will be the final resolved result.
 *
 * @returns {Promise} Promise Output of spawn command.
 * - E.g. 'sudo apg-get install' for Debian based systems.
 * - Defaults to 'get os-manager installer' if no package manager is found.
 * @rejects On any spawn error, or if `process.platform` is none of
 * darwin, freebsd, linux, sunos or win32.
 */
export const installer = Sys.installer = function (application, progress) {
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
  else if ((args) && (install))
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
 * Determine if a value is a Function
 *
 * @param {Object} value The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(value) {
  return Object.prototype.toString.call(value) === '[object Function]';
}

/**
 * Spawn subprocess with `Promise` features, and `progress` callback for `stdout.on('data') `event.
 *
 * @param {String} command - platform command
 * @param {Array} argument - command arguments
 * @param {Function|Object} progressOptions - either callback for `stdout.on('data')` event or spawn options.
 *```js
 * { handle: object, output: string }
 *```
 * - the callback will received an object, child process `instance` **handle**, and any **output** data.
 * - any returns will be the **`resolve()` .then()** handler.
 * @param {Object} options - Any child process `spawn` options, defaults: stdio: 'pipe'.
 * - Additionally:
 *```js
 * sudo: boolean, // run as administrator.
 * fork: string, //  execute an additional module, a child_process.`fork` IPC communication channel.
 * onerror: callable, // callback for `stderr.on('data')` event.
 * onprogress: callable, // callback for `stdout.on('data')` event.
 * onmessage: callable, // callback for `on('message')` for `fork` event.
 *```
 */
export const spawning = Sys.spawning = function (command, argument, progressOptions, options) {
  return new Promise((resolve, reject) => {
    options = options || {
      stdio: 'pipe',
      sudo: false,
      fork: null,
      onerror: null,
      onprogress: null,
      onmessage: null,
    };

    let progress = progressOptions;
    if (typeof progressOptions == 'object' && !isFunction(progressOptions))
      options = Object.assign(options, progressOptions);

    if (isFunction(options.onprogress))
      progress = options.onprogress;

    let error = null;
    let output = null;
    let sudo = options.sudo || false;
    let forking = options.fork || null;
    let onerror = options.onerror || null;
    let onmessage = options.onmessage || null;

    if (typeof forking == 'string')
      var forked = fork(forking);

    delete options.sudo;
    delete options.fork;
    delete options.onerror;
    delete options.onprogress;
    delete options.onmessage;

    if (sudo) {
      argument = [command].concat(argument);
      command = (process.platform == 'win32') ? join(__dirname, 'bin', 'sudo.bat') : 'sudo';
    };

    const spawned = spawn(command, argument, options);
    spawned.on('error', (data) => {

      return reject(data);
    });

    spawned.on('close', (code) => {
      if (code === 0) {
        return resolve(output);
      }

      return reject(error, code);
    });

    spawned.on('exit', () => {
      if (forked)
        setTimeout(() => {
          forked.kill();
        }, 1000);

      return resolve(output);
    });

    spawned.stdout.on('data', (data) => {
      let input = data.toString();
      output += input;
      try {
        if (isFunction(progress)) {
          output = progress({ handle: spawned, output: input, fork: forked }) || output;
        }
      } catch (e) {
        return reject(e.toString());
      }

      if (argument.includes('fake-js')) {
        spawned.kill('SIGKILL');
        return resolve('For testing only. ' + output);
      }
    });

    spawned.stderr.on('data', (data) => {
      let err = data.toString();
      error += err;
      if (isFunction(onerror))/* c8 ignore next */
        error = onerror(err) || error;
    });

    if (forked) {
      forked.on('message', (data) => {
        if (isFunction(onmessage))
          onmessage(data);
      });
    }

    if (argument.includes('fake-js') && Object.getOwnPropertyDescriptor(process, 'platform').value == 'darwin') {
      spawned.kill('SIGKILL');
      return resolve('For testing only. ' + output);
    }
  });
}

function Sys() { }

export default Sys;
