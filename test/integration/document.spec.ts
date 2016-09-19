/// <reference path='../../typings/index.d.ts' />
import Schema from '../../src/schema';
import nestedSchema = require('../fixtures/nested-schema.json');

describe('Document', () => {
  it('creates an object of all the property descriptions', () => {
    const schema = new Schema(nestedSchema);
    expect(schema.document()).toEqual({
      "baz": {
        "description": "top level value",
        "type": "string"
      },
      "foo.bar": {
        "default": "baz",
        "description": "nested schema key",
        "type": "string"
      }
    });
  });
});
