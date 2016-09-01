/* eslint-disable import/no-extraneous-dependencies */
import sinon from 'sinon';
import chai from 'chai';
import assert from 'assert';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(sinonChai);
chai.use(chaiAsPromised);

global.chai = chai;
global.sinon = sinon;
global.assert = assert;
global.expect = chai.expect;
global.should = chai.should();
