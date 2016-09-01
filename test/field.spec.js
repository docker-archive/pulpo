import Field from '../src/field';

describe('Field', () => {
  describe('constructor', () => {
    it('validates the construction', () => {
      const spy = sinon.spy(Field.prototype, 'validateConstruction');
      const args = ['foo', { foo: 'bar' }, { requiredKeys: ['foo'] }];
      new Field(...args);
      spy.should.have.been.calledWith(...args);
      spy.restore();
    });

    it('builds an array of keys from optional and required keys', () => {
      const options = { requiredKeys: ['foo'], optionalKeys: ['bar'] };
      const field = new Field('foo', { foo: 'bar' }, options);
      expect(field.reservedKeys.sort().join(',')).to.equal('bar,foo');
    });

    it('stores the field name', () => {
      const field = new Field('foo', { foo: 'bar' }, { requiredKeys: ['foo'] });
      field.name.should.equal('foo');
    });
  });

  describe('validateConstruction', () => {
    const execute = (...args) => Field.prototype.validateConstruction.bind(
      null, ...args
    );

    it('throws when name is not provided', () => {
      expect(execute(null, {})).to.throw();
    });

    it('throws when definition is not an object', () => {
      expect(execute('foo', [])).to.throw();
    });

    it('throws when options is not an object', () => {
      expect(execute('foo', {}, 'bar')).to.throw();
    });

    it('throws when options.requiredKeys is not an array', () => {
      expect(execute('foo', {}, { requiredKeys: 'bar' })).to.throw();
    });

    it('throws when options.optionalKeys is not an array', () => {
      expect(execute('foo', {}, { optionalKeys: 'bar' })).to.throw();
    });
  });

  describe('parseDefinition', () => {
    it('checks all required keys are given', () => {
      const spy = sinon.spy(Field.prototype, 'validateDefinition');
      const raw = { default: '', type: String, description: 'Foo' };
      new Field('foo', raw);
      spy.should.have.been.calledWith(raw);
      spy.restore();
    });
  });

  describe('validateDefinition', () => {
    it('looks for required keys in options', () => {
      const field = new Field('foo', { foo: 'bar' }, { requiredKeys: ['foo'] });
      expect(field.validateDefinition.bind(field, {})).to.throw();
    });
  });

  describe('extractDefinitionValues', () => {
    // eslint-disable-next-line global-require
    const rawSchema = require('./fixtures/nested-schema');

    it('parses required and optional fields into a schema', () => {
      const field = new Field('foo', rawSchema.foo);
      should.exist(field.schema.description);
    });

    it('creates fields out of nested values', () => {
      const field = new Field('foo', rawSchema.foo);
      field.nested.nested.name.should.equal('nested');
    });
  });
});
