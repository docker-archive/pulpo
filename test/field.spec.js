import Field from '../src/field';

describe('Field', () => {
  describe('constructor', () => {
    it('validates the construction', () => {
      const spy = sinon.spy(Field.prototype, 'validateConstruction');
      const args = ['foo', { bar: 'baz' }, { requiredKeys: ['bar'] }];
      new Field(...args);
      spy.should.have.been.calledWith(...args);
      spy.restore();
    });

    it('builds an array of keys from optional and required keys', () => {
      const options = { requiredKeys: ['bar'], optionalKeys: ['baz'] };
      const field = new Field('foo', { bar: 'baz' }, options);
      expect(field.reservedKeys.sort().join(',')).to.equal('bar,baz');
    });

    it('validates the field name', () => {
      const spy = sinon.spy(Field.prototype, 'validateName');
      const args = ['foo', { bar: 'baz' }, { requiredKeys: ['bar'] }];
      new Field(...args);
      spy.should.have.been.calledWith('foo');
      spy.restore();
    });

    it('stores the field name', () => {
      const field = new Field('foo', { bar: 'baz' }, { requiredKeys: ['bar'] });
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

    it('does not throw when args are properly formatted', () => {
      expect(
        execute('foo', {}, { requiredKeys: ['bar'], optionalKeys: ['baz'] })
      ).not.to.throw();
    });
  });

  describe('validateName', () => {
    it('only throws if name is a reserved key', () => {
      const obj = { reservedKeys: ['foo'] };
      expect(Field.prototype.validateName.bind(obj, 'foo')).to.throw();
      expect(Field.prototype.validateName.bind(obj, 'bar')).not.to.throw();
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
      const field = new Field('foo', { bar: 'baz' }, { requiredKeys: ['bar'] });
      expect(field.validateDefinition.bind(field, {})).to.throw();
    });
  });

  describe('extractDefinitionValues', () => {
    // eslint-disable-next-line global-require
    const rawSchema = require('./fixtures/nested-schema');

    it('parses required and optional fields into a schema', () => {
      const field = new Field('bar', rawSchema.foo);
      should.exist(field.schema.description);
    });

    it('creates fields out of nested values', () => {
      const field = new Field('bar', rawSchema.foo);
      field.nested.nested.name.should.equal('nested');
    });
  });
});
