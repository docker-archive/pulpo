import Schema from '../src/schema';

describe('Schema', () => {
  describe('creating a new schema', () => {
    it('takes a JSON object on instantiation', () => {
      const spy = sinon.spy(Schema.prototype, 'load');
      const rawSchema = {
        foo: { default: '', type: String, description: 'Foo' },
      };
      new Schema(rawSchema);
      spy.should.have.been.calledWith(rawSchema);
      spy.restore();
    });

    it('stores passed in options', () => {
      const options = { foo: 'bar' };
      new Schema(null, options).options.foo.should.equal(options.foo);
    });
  });

  describe('loading rawSchema', () => {
    it('checks that schema is not already loaded', () => {
      const schema = new Schema();
      schema.schema = {};
      expect(schema.load.bind(schema, {})).to.throw();
    });

    it('creates fields out of each key', () => {
      const schema = new Schema(
        { foo: { bar: 'baz' } },
        { requiredKeys: ['bar'] }
      );
      expect(schema.fields.foo.name).to.be.equal('foo');
    });
  });
});
