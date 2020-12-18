import chai from 'chai';
import Sys from '../index.js';
import { packager, installer, where, spawning } from '../index.js';

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
      expect(object.handle).to.be.instanceOf(Object);
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
    spawning('echo', [''], (object) => {
      expect(object).to.be.a('object');
      expect(object.handle).to.be.instanceOf(Object);
      expect(object.output).to.be.a('string');
      return 'hello';
    }, { stdio: 'pipe', shell: true })
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

  it('should catch error on throw from `progress`', function (done) {
    spawning('echo', [''], () => {
      throw 'hello';
    }, { stdio: 'pipe', shell: true })
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
});

describe('Method: `where`', function () {
  it('should return null/empty for executable not found', function (done) {
    let found = where('fake-js');
    expect(found).to.be.null;
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
