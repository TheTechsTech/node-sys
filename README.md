# node-sys

[![NPM](https://nodei.co/npm/node-sys.png)](https://nodei.co/npm/node-sys/)

[![Dependencies Status](http://img.shields.io/david/techno-express/node-sys.svg)](https://david-dm.org/techno-express/node-sys) [![Node.js CI](https://github.com/techno-express/node-sys/workflows/Node.js%20CI/badge.svg)](https://github.com/techno-express/node-sys/actions) [![codecov](https://codecov.io/gh/techno-express/node-sys/branch/master/graph/badge.svg?token=5Mi0USRYsY)](https://codecov.io/gh/techno-express/node-sys) [![Maintainability](https://api.codeclimate.com/v1/badges/54f89d3ae887724ceb93/maintainability)](https://codeclimate.com/github/techno-express/system-install/maintainability) [![Release](http://img.shields.io/npm/v/node-sys.svg)](https://www.npmjs.org/package/node-sys)

> Universal package installer, get the command for managing packages, or auto install any package, using one command for all platforms. E.g. `sudo apt-get install` *!@#$software* for Debian-based systems, would be `node-sys` *!@#$software*.

This is mainly focused on initial installation of an Node JS packages that needs additional host software installed. This allows pre and post script install routines. Can also automate the installation of macOS Brew, and Windows Chocolatey package managers.

`node-sys` will try to find which system packaging is installed for the given `process.platform`. If no system package manager is found, `'No package manager found!'` is returned.

A `spawning` cross-platform version of Node's child_process.`spawn` that returns a **Promise**, with additions:

- easily execute as administrator, on `Windows` a pop up **UAC** window will appear.
- pass callbacks, for `stderr` and `stdout` **on** `data` events, any _returns_ will be the **reject/resolve** result.
- `fork` another **script**, a _Node Js_ module instance, for additional sub processing base on `stderr` or `stdout` events.
  - pass additional callback for the `message` event.

A series of general use case `strick` type checkers.

## Install

```sh
npm install node-sys
```

## Usage

```js
import { packager } from 'node-sys';

/**
 * Gets the system package manager install command.
 *
 * - 'brew install' on OS X if homebrew is installed.
 * - 'sudo apt-get install' on debian platforms.
 * - 'sudo yum install' on red hat platforms.
 * - 'System OS package manager not found' if no package manager is found.
 *
 * Throws if `process.platform` is none of darwin, freebsd, linux, sunos or win32.
 */
const sys = packager();

console.log('Do system OS require sudo? ' + sys.sudo);
console.log('The system OS install command: ' + sys.command);
console.log('To fully install a `pandoc` package run: ' + sys.installer + ' pandoc');
```

### Install `vim` package onto host, using system's default package manager

- *Returns* a `Promise`

```js
import { installer } from  'node-sys';

// Progress callback for any output doing installation.
// Any value returned in `callback` will be the final resolved output result.
const onprogress = (object) => {
  console.log(object.output);
}

installer('vim', onprogress)
.then(function(data){
    // returns installation output
    console.log(data);
})
.catch(function(err) {
    console.log(err);
});
```

### API - `spawning`(command, arguments, progressOptions, options)

`import { spawning } from 'node-sys';`

`Spawning` takes an additional argument, `progressOptions`, its [`options`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) are the same as those of `child_process.spawn` plus:

```js
 sudo: boolean, // run as administrator
 fork: string, //  execute an additional module, of Node Js process `fork` IPC communication channel.
 onerror: callable, // callback for `stderr.on('data')` event.
 onprogress: callable, // callback for `stdout.on('data')` event.
 onmessage: callable, // callback for `on('message')` for `fork` event.
 ```

`Spawning` returns a promise whose result will be any output or any data return in the progress callback.

*The progress callback will receive an object with these properties:*

- `spawn:` *Object* - Spawned child process instance handle.
  - Access the child process object.

- `output:` *String* - Output from stdout.
  - Output can be altered and if returned will replace the otherwise resolved result.

- `fork:` *Object* - An additional [forked](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options) Node Js process handle, IPC communication channel.
  - Execute additional processing base off of sub child process output, with module a script.

If there's an error running the child process, received data on stderr, or errors in progress callback, `spawning` rejects the returned promise.

### General *`strict`* type *`check`* functions

```js
import {
  isArray, // True if value is an Array, otherwise false.
  isUndefined, // True if the value is undefined, otherwise false.
  isBuffer, // True if value is a Buffer, otherwise false.
  isArrayBuffer, // True if value is an ArrayBuffer, otherwise false.
  isString, // True if value is a String, otherwise false.
  isNumber, // True if value is a Number, otherwise false.
  isObject, // True if value is an Object, otherwise false.
  isObjectOnly, // True if value is a `Object` only, otherwise false, not an Array, Function, or any other type.
  isBlob, // True if value is a Blob, otherwise false.
  isFunction, // True if value is a Function, otherwise false.
  isDate, // True if value is a Date, otherwise false.
  isStream, // True if value is a Stream, otherwise false.
  isNull, // True if value is a null, otherwise false.
  isBool, // True if value is a boolean, otherwise false.
  isWindows, // True if platform a Windows OS, otherwise false.
  isLinux, // True if platform a Linux OS, otherwise false.
  isMac, // True if platform a Apple macOS, otherwise false.
} from 'node-sys';
```

### Find any executable

The `sync` from [node-which](https://github.com/npm/node-which) has been exported to `where`.

```js
import { where } from 'node-sys';

// Like the unix `which` utility, will be a `string`, or `null` for not found.
let found = where('node');
```

### Use CommonJS `require` like before in ESM

```js
import { require } from 'node-sys';

const package = require('package');
```

### CLI Usage

```s
npm i -g node-sys
```

To display your system package manage command.

```s
$ node-sys
brew install
```

To actually install an system package.

```s
$ node-sys vim
installing...
```

To install an System OS package manager.

- Will install [chocolatey] for **Windows OS**
- Will install [brew] for **Apple macOS**

```s
$ node-sys -g | --get # or npm run get-installer
...
```

## Supported package managers

### FreeBSD

- [pkg]
- [pkg_add]

### Linux

- [apt-get] - Debian, Ubuntu
- [dnf] - fedora
- [emerge] - Gentoo
- [nix] - NixOS
- [pacman] - ArchLinux
- [yum] - fedora
- [zypper] - OpenSUSE
- [chromebrew] - Chrome OS

### OS X

- [brew]
- [pkgin]
- [port]

### Solaris

- [pkg](https://docs.oracle.com/cd/E23824_01/html/E21802/gihhp.html)

### Windows

- [winget]
- [chocolatey]

[apt-get]: https://help.ubuntu.com/community/AptGet/Howto
[brew]: http://brew.sh
[pacman]: https://wiki.archlinux.org/index.php/pacman
[yum]: https://fedoraproject.org/wiki/Yum
[dnf]: https://fedoraproject.org/wiki/Dnf
[nix]: https://nixos.org/nix/
[zypper]: https://en.opensuse.org/Portal:Zypper
[emerge]: https://wiki.gentoo.org/wiki/Portage
[port]: https://guide.macports.org/#using.port
[pkgin]: https://github.com/cmacrae/saveosx
[pkg]: https://www.freebsd.org/doc/handbook/pkgng-intro.html
[pkg_add]: https://www.freebsd.org/cgi/man.cgi?query=pkg_add&manpath=FreeBSD+7.2-RELEASE
[winget]: https://github.com/microsoft/winget-cli
[chocolatey]: https://chocolatey.org
[chromebrew]: https://github.com/skycocker/chromebrew
