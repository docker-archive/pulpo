/// <reference path='../../typings/index.d.ts' />
import Schema from '../../src/schema';

describe('Cast', () => {
  it('throws when wrong type provided', () => {
    const schema = new Schema({
      number: {
        description: 'description',
        type: 'number',
        default: () => 8888,
      },
      string: {
        description: 'description',
        type: 'string',
        default: 'foo',
      },
      boolean: {
        description: 'description',
        type: 'boolean',
        default: () => false,
      },
      array: {
        description: 'description',
        type: 'array',
        default: [],
      },
      object: {
        description: 'description',
        type: 'object',
        default: () => {},
      }
    });

    expect(schema.hydrate.bind(schema, {number: 'foo'}, {cast: false})).toThrow();
    expect(schema.hydrate.bind(schema, {number: '3000'})).not.toThrow();
    expect(schema.hydrate.bind(schema, {number: 3000}, {cast: false})).not.toThrow();

    expect(schema.hydrate.bind(schema, {string: {}}, {cast: false})).toThrow();
    expect(schema.hydrate.bind(schema, {string: 1})).not.toThrow();
    expect(schema.hydrate.bind(schema, {string: 'bar'}, {cast: false})).not.toThrow();

    expect(schema.hydrate.bind(schema, {boolean: {}}, {cast: false})).toThrow();
    expect(schema.hydrate.bind(schema, {boolean: 1})).not.toThrow();
    expect(schema.hydrate.bind(schema, {boolean: false}, {cast: false})).not.toThrow();

    expect(schema.hydrate.bind(schema, {array: 'foo'}, {cast: false})).toThrow();
    expect(schema.hydrate.bind(schema, {array: '[]'})).not.toThrow();
    expect(schema.hydrate.bind(schema, {array: []}, {cast: false})).not.toThrow();

    expect(schema.hydrate.bind(schema, {object: 1}, {cast: false})).toThrow();
    expect(schema.hydrate.bind(schema, {object: '{}'})).not.toThrow();
  });
});
