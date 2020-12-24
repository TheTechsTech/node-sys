import chai from 'chai';
import Sys from '../index.js';
import {
  Readable
} from 'stream';
import {
  packager, installer,
  where, spawning, System,
  isLinux, isMac, isWindows, require
} from '../index.js';

const expect = chai.expect;

describe('Method: `packager`', function () {
  it('should return an object', function (done) {
    expect(packager()).to.be.an('object');
    done();
  });

  it('should return an object key value of string and boolean', function (done) {
    let i = packager();
    expect(i.sudo).to.be.a('boolean');
    expect(i.command).to.be.a('string');
    expect(i.installer).to.be.a('string');
    done();
  });
});

describe('Method: `packager` for platform set to `other`', function () {
  // save original process.platform
  before(function () {
    this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    // redefine process.platform
    Object.defineProperty(process, 'platform', {
      value: 'other'
    });
  });
  // restore original process.platform
  after(function () {
    Object.defineProperty(process, 'platform', this.originalPlatform);
  });

  it('should return an error for unknown platform', function (done) {
    expect(packager()).to.be.an.instanceof(Error);
    done();
  });
});

describe('Method: `packager` for platform set to `netbsd`', function () {
  // save original process.platform
  before(function () {
    this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    // redefine process.platform
    Object.defineProperty(process, 'platform', {
      value: 'netbsd'
    });
  });
  // restore original process.platform
  after(function () {
    Object.defineProperty(process, 'platform', this.originalPlatform);
  });

  it('should return an error for no package manager found', function (done) {
    expect(packager()).match(/System OS package manager not found/i);
    done();
  });
});

describe('Method: `packager` for platform set to `win32`', function () {
  // save original process.platform
  before(function () {
    this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    // redefine process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win32'
    });
  });
  // restore original process.platform
  after(function () {
    Object.defineProperty(process, 'platform', this.originalPlatform);
  });

  it('should return `false` for need sudo', function (done) {
    let sys = packager();
    expect(sys.sudo).to.not.equal(true);
    done();
  });
});

describe('Method: `installer`', function () {
  it('should return an error for no package, application name missing', function (done) {
    installer(null)
      .catch(function (err) {
        expect(err).match(/No package, application name missing./i);
        done();
      });
  });
});

describe('Method: `installer` for platform set to `other`', function () {
  // save original process.platform
  before(function () {
    this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    // redefine process.platform
    Object.defineProperty(process, 'platform', {
      value: 'other'
    });
  });
  // restore original process.platform
  after(function () {
    Object.defineProperty(process, 'platform', this.originalPlatform);
  });

  it('should return an error for unknown platform', function (done) {
    installer('winrar')
      .catch(function (err) {
        expect(err).match(/unknown platform./i);
        done();
      });
  });
});

describe('Method: `installer` install packages `unzip` and `nano`', function () {
  it('should return on successful install of multiple packages or print error on unknown platform', function (done) {
    let multi = ['unzip', 'nano', 'fake-js', '--noop'];

    installer(multi)
      .then(function (data) {
        expect(data).to.be.a('string');
        done();
      })
      .catch(function (err) {
        expect(err).to.not.be.empty;
        done();
      });
  });
});

describe('Method: `installer` install packages `unzip` and `nano`, platform set to `win64`', function () {
  // save original process.platform
  before(function () {
    this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    // redefine process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win64'
    });
  });
  // restore original process.platform
  after(function () {
    Object.defineProperty(process, 'platform', this.originalPlatform);
  });

  it('should return on successful install of multiple packages or print error on unknown platform, platform set to `win64`', function (done) {
    let multi = ['unzip', 'nano', 'fake-js'];

    installer(multi)
      .then(function (data) {
        expect(data).to.be.a('string');
        done();
      })
      .catch(function (err) {
        expect(err).to.not.be.empty;
        done();
      });
  });
});

describe('Method: `installer` install packages `unzip`, platform set to `shell`', function () {
  // save original process.platform
  before(function () {
    this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    // redefine process.platform
    Object.defineProperty(process, 'platform', {
      value: 'shell'
    });
  });
  // restore original process.platform
  after(function () {
    Object.defineProperty(process, 'platform', this.originalPlatform);
  });

  it('should error on no package manager installed, platform set to `shell`', function (done) {
    installer('unzip')
      .catch(function (err) {
        expect(err).to.not.be.empty;
        done();
      });
  });
});

describe('Method: `installer` and progress callback, platform set to `win64`', function () {
  // save original process.platform
  before(function () {
    this.originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform');
    // redefine process.platform
    Object.defineProperty(process, 'platform', {
      value: 'win64'
    });
  });
  // restore original process.platform
  after(function () {
    Object.defineProperty(process, 'platform', this.originalPlatform);
  });

  it('should return on successful install of multiple packages with different output from `progress`, platform set to `win64`', function (done) {
    let multi = ['unzip', 'nano', 'fake-js'];
    installer(multi, (object) => {
      expect(object).to.be.a('object');
      expect(object.spawn).to.be.instanceOf(Object);
      expect(object.output).to.be.a('string');
      return 'hello world';
    })
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.equal('For testing only. hello world');
        done();
      })
      .catch(function (err) {
        expect(err).to.be.empty;
        done();
      });
  });
});

describe('Method: `spawning`', function () {
  it('should return on successful install with output from `progress`', function (done) {
    let cmd = process.platform == 'win32' ? 'echo | set /p dummyName=1' : 'printf 1';
    spawning(cmd, [], (object) => {
      expect(object).to.be.a('object');
      expect(object.spawn).to.be.instanceOf(Object);
      expect(object.output).to.be.a('string');
      return object.output + ' hello';
    }, { stdio: 'pipe', shell: true })
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.equal('1 hello');
        done();
      })
      .catch(function (err) {
        console.log(err);
        expect(err).to.be.empty;
        done();
      });
  });

  it('should catch error on throw from `progress`', function (done) {
    spawning('echo', [''], () => {
      throw 'hello';
    }, { shell: true })
      .catch(function (err) {
        expect(err).to.equal('hello');
        done();
      });
  });

  it('should catch and instant of `Error` on any spawn exceptions', function (done) {
    spawning('xxxxx', [''], null, { stdio: 'pipe', })
      .catch(function (err) {
        expect(err).to.be.instanceof(Error);
        done();
      });
  });

  it('should return on successful install with output from `onprogress`', function (done) {
    spawning('echo', [''], null, {
      stdio: 'pipe',
      shell: true,
      onerror: (err) => { return 'testing: ' + err; },
      onprogress: (object) => {
        expect(object).to.be.a('object');
        expect(object.spawn).to.be.instanceOf(Object);
        expect(object.output).to.be.a('string');
        return 'hello';
      },
    })
      .then(function (data) {
        expect(data).to.be.a('string');
        expect(data).to.equal('hello');
        done();
      })
      .catch(function (err) {
        expect(err).to.be.empty;
        done();
      });
  });

  it('should return on successful install with output with options `null`', function (done) {
    spawning('echo', ['1'], { shell: true })
      .then(function (data) {
        expect(data).to.be.a('string');
        done();
      })
      .catch(function (err) {
        expect(err).to.be.empty;
        done();
      });
  });

  it('should catch error on throw from `onprogress`', function (done) {
    spawning('echo', [''], {
      stdio: 'pipe',
      shell: true,
      onerror: (err) => { return 'testing: ' + err; },
      onprogress: () => {
        throw 'hello';
      },
    })
      .catch(function (err) {
        expect(err).to.equal('hello');
        done();
      });
  });

  it('should return on successful `Sudo` run and catch any exceptions', function (done) {
    spawning((process.platform == 'win32' ? 'dir' : 'ls'), ['..'], null, {
      stdio: 'pipe',
      shell: true,
      sudo: true,
      onerror: (err) => { return 'testing: ' + err; },
      onprogress: () => { }
    })
      .then(function () {
        done();
      })
      .catch(function (err) {
        expect(err).to.contains('testing: ');
        done();
      });
  });

  it('should return on successful from `onprogress`', function (done) {
    spawning((process.platform == 'win32' ? 'dir' : 'ls'), ['..'], null, {
      stdio: 'pipe',
      shell: true,
      onprogress: (object) => {
        expect(object.output).to.be.a('string');
        return 'done';
      }
    })
      .then(function (data) {
        expect(data).to.equal('done');
        done();
      });
  });

  it('should receive message from `fork` process', function (done) {
    spawning((process.platform == 'win32' ? 'dir' : 'ls'), ['..'], null, {
      stdio: 'pipe',
      shell: true,
      fork: 'test/sub.cjs',
      onprogress: (object) => {
        expect(object.fork).to.be.instanceOf(Object);
        object.fork.send('hello');
        return { fork: object.fork, output: 'done' };
      },
      onmessage: (data) => {
        expect(data.hello).to.equal('world');
      },
    })
      .then(function (data) {
        expect(data.output).to.equal('done');
        expect(data.fork).to.be.instanceOf(Object);
        done();
      });
  });
});

describe('Method: `where`', function () {
  it('should return null/empty for executable not found', function (done) {
    let found = where('fake-js');
    expect(found).to.be.null;
    done();
  });
});

describe('Method: `require`', function () {
  it('should return included module like CommonJs', function (done) {
    const which = require('which');
    expect(Sys.isFunction(which)).to.equal(true);
    done();
  });
});

describe('Function: `Sys`', function () {
  it('should instanced itself like a class', function () {
    const sys = new Sys();
    expect(sys).to.be.an.instanceof(Sys);
  });

  it('should respond to commands as methods', function () {
    expect(Sys).itself.to.respondTo('installer');
    expect(Sys).itself.to.respondTo('where');
    expect(Sys).itself.to.respondTo('packager');
    expect(Sys).itself.to.respondTo('spawning');
  });

});

describe('Function: `System` Check Methods', function () {
  it('should instanced itself like a class', function () {
    const system = new System();
    expect(system).to.be.an.instanceof(System);
  });

  it('should respond to commands as methods', function () {
    expect(System).itself.to.respondTo('isArray');
    expect(System).itself.to.respondTo('isBuffer');
    expect(System).itself.to.respondTo('isArrayBuffer');
    expect(System).itself.to.respondTo('isBlob');
    expect(System).itself.to.respondTo('isString');
    expect(System).itself.to.respondTo('isNumber');
    expect(System).itself.to.respondTo('isUndefined');
    expect(System).itself.to.respondTo('isObject');
    expect(System).itself.to.respondTo('isObjectOnly');
    expect(System).itself.to.respondTo('isDate');
    expect(System).itself.to.respondTo('isFunction');
    expect(System).itself.to.respondTo('isStream');
    expect(System).itself.to.respondTo('isNull');
    expect(System).itself.to.respondTo('isBool');
    expect(System).itself.to.respondTo('isWindows');
    expect(System).itself.to.respondTo('isLinux');
    expect(System).itself.to.respondTo('isMac');
  });

  class Blob { };
  Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
    value: 'Blob',
    writable: false,
    enumerable: false,
    configurable: true
  });

  it('should validate Array', function () {
    expect(System.isArray([])).to.equal(true);
    expect(System.isArray({
      length: 5
    })).to.equal(false);
  });

  it('should validate Buffer', function () {
    expect(System.isBuffer(Buffer.from('a'))).to.equal(true);
    expect(System.isBuffer(null)).to.equal(false);
    expect(System.isBuffer(undefined)).to.equal(false);
  });

  it('should validate ArrayBuffer', function () {
    expect(System.isArrayBuffer(new ArrayBuffer(2))).to.equal(true);
    expect(System.isArrayBuffer({})).to.equal(false);
  });

  it('should validate Blob', function () {
    expect(System.isBlob(new Blob())).to.equal(true);
  });

  it('should validate String', function () {
    expect(System.isString('')).to.equal(true);
    expect(System.isString({
      toString: function () {
        return '';
      }
    })).to.equal(false);
  });

  it('should validate Number', function () {
    expect(System.isNumber(123)).to.equal(true);
    expect(System.isNumber('123')).to.equal(false);
  });

  it('should validate Undefined', function () {
    expect(System.isUndefined()).to.equal(true);
    expect(System.isUndefined(null)).to.equal(false);
  });

  it('should validate Object', function () {
    expect(System.isObject({})).to.equal(true);
    expect(System.isObject([])).to.equal(true);
    expect(System.isObject(null)).to.equal(false);
  });

  it('should validate only Object, not a Array or Function', function () {
    expect(System.isObjectOnly({})).to.equal(true);
    expect(System.isObjectOnly([])).to.equal(false);
    expect(System.isObjectOnly(() => { })).to.equal(false);
    expect(System.isObjectOnly(null)).to.equal(false);
    expect(System.isObjectOnly(Object.create({}))).to.equal(false);
  });

  it('should validate Date', function () {
    expect(System.isDate(new Date())).to.equal(true);
    expect(System.isDate(Date.now())).to.equal(false);
  });

  it('should validate Function', function () {
    expect(System.isFunction(function () { })).to.equal(true);
    expect(System.isFunction('function')).to.equal(false);
  });

  it('should validate Stream', function () {
    expect(System.isStream(new Readable())).to.equal(true);
    expect(System.isStream({
      foo: 'bar'
    })).to.equal(false);
  });

  it('should validate null', function () {
    expect(System.isNull(null)).to.equal(true);
    expect(System.isNull()).to.equal(false);
    expect(System.isNull(false)).to.equal(false);
    expect(System.isNull(0)).to.equal(false);
  });

  it('should validate boolean', function () {
    expect(System.isBool(true)).to.equal(true);
    expect(System.isBool(false)).to.equal(true);
    expect(System.isBool(null)).to.equal(false);
    expect(System.isBool()).to.equal(false);
    expect(System.isBool('')).to.equal(false);
    expect(System.isBool(1)).to.equal(false);
    expect(System.isBool(0)).to.equal(false);
    expect(System.isBool(isWindows())).to.equal(true);
    expect(System.isBool(isLinux())).to.equal(true);
    expect(System.isBool(isMac())).to.equal(true);
  });
});
