/// <reference path='../../typings/index.d.ts' />
import Schema from '../../src/schema';

describe('Cast and Validate', () => {
  it('throws when required value not found', () => {
    const schema = new Schema({
      foo: {
        description: 'testing',
        type: 'string',
        required: true
      }
    });

    expect(schema.hydrate.bind(schema)).toThrow();
    expect(schema.hydrate.bind(schema, {foo: 'string'})).not.toThrow();
  });
});
