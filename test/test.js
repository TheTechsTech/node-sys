import chai from 'chai';
import { packager } from '../index.js';
import { installer } from '../index.js';
import { where } from '../index.js';

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
    console.log(i.installer);
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
    let i = packager();
    expect(i.sudo).to.not.equal(true);
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
    let multi = ['unzip', 'nano', 'node-fake-tester'];

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

describe('Method: `where`', function () {
  it('should return null/empty for executable not found', function (done) {
    let found = where('node-fake-tester');
    expect(found).to.be.null;
    done();

  });
});
