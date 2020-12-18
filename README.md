# node-sys

[![NPM](https://nodei.co/npm/node-sys.png)](https://nodei.co/npm/node-sys/)

[![Dependencies Status](http://img.shields.io/david/techno-express/node-sys.svg)](https://david-dm.org/techno-express/node-sys) [![Node.js CI](https://github.com/techno-express/node-sys/workflows/Node.js%20CI/badge.svg)](https://github.com/techno-express/node-sys/actions) [![codecov](https://codecov.io/gh/techno-express/node-sys/branch/master/graph/badge.svg?token=5Mi0USRYsY)](https://codecov.io/gh/techno-express/node-sys) [![Maintainability](https://api.codeclimate.com/v1/badges/54f89d3ae887724ceb93/maintainability)](https://codeclimate.com/github/techno-express/system-install/maintainability) [![Release](http://img.shields.io/npm/v/node-sys.svg)](https://www.npmjs.org/package/node-sys)

> Universal package installer, get the command for managing packages, or auto install any package, using one command for all platforms. E.g. `sudo apt-get install` *!@#$software* for Debian-based systems, would be `node-sys` *!@#$software*.

This is mainly focused on initial installation of an Node JS packages that needs additional host software installed. This allows pre and post script install routines. Can also automate the installation of macOS Brew, and Windows Chocolatey package managers.

`node-sys` will try to find which system packaging is installed for the given `process.platform`. If no system package manager is found, `'No package manager found!'` is returned.

A `spawning` cross-platform version of Node's child_process.`spawn` that returns a **Promise**.

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

* Returns a Promise

```js
import { installer } from  'node-sys';
installer('vim')
.then(function(data){
    // returns installation output
    console.log(data);
})
.catch(function(err) {
    console.log(err);
});
```

## API - spawning(command, arguments, progressOptions, options)

`Spawning` takes an additional argument, `progressOptions`, its [`options`](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options) are the same as those of `child_process.spawn` plus:

```js
 sudo: boolean, // run as administrator
 onerror: callable, // callback for `stderr.on('data')` event.
 onprogress: callable, // callback for `stdout.on('data')` event.
 // onmessage: callable, // callback for send `on('message')` event.
 ```

`Spawning` returns a promise whose result will be any output or any data return in the progress callback.

*The progress callback will receive an object with these properties:*

* `handle:` *Object* - Spawned child process instance handler.
  * Access the child process object.

* `output:` *String* - Output from stdout.
  * Output can be altered and if returned will replace the otherwise resolved result.

If there's an error running the child process, received data on stderr, or errors in progress callback, `spawning` rejects the returned promise.

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

* Will install [chocolatey] for **Windows OS**
* Will install [brew] for **Apple macOS**

```s
$ node-sys -g | --get # or npm run get-installer
...
```

## Supported package managers

### FreeBSD

* [pkg]
* [pkg_add]

### Linux

* [apt-get] - Debian, Ubuntu
* [dnf] - fedora
* [emerge] - Gentoo
* [nix] - NixOS
* [pacman] - ArchLinux
* [yum] - fedora
* [zypper] - OpenSUSE
* [chromebrew] - Chrome OS

### OS X

* [brew]
* [pkgin]
* [port]

### Solaris

* [pkg](https://docs.oracle.com/cd/E23824_01/html/E21802/gihhp.html)

### Windows

* [chocolatey]

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
[chocolatey]: https://chocolatey.org
[chromebrew]: https://github.com/skycocker/chromebrew
