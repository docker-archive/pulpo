/// <reference path='../../typings/index.d.ts' />
import Schema from '../../src/schema';
import nestedSchema = require('../fixtures/nested-schema.json');
import brokenNestedSchema = require('../fixtures/broken-nested-schema.json');
import selfReferencingSchema = require('../fixtures/self-referencing-schema.json');

describe('parsing nested schemas', () => {
  it('will properly parse a nested schema into keyed values', () => {
    const schema = new Schema(nestedSchema);
    expect(schema.hydrate()).toEqual({foo: {bar: 'baz'}})
  });

  it('will throw on broken nested schema', () => {
    expect(() => new Schema(brokenNestedSchema)).toThrow(
      new Error(`Property definition for foo is illegal`)
    );
  });

  it('will hydrate a nested schema', () => {
    const schema = new Schema(nestedSchema);
    expect(schema.hydrate({foo: {bar: 'hello world'}, baz: 'testing'})).toEqual({
      foo: {
        bar: 'hello world'
      },
      baz: 'testing'
    });
  });
});

describe('parsing functions', () => {
  it('passes the config object in', () => {
    const schema = new Schema(nestedSchema);
    expect(schema.hydrate({
      foo: {
        bar: 'value for bar',
      },
      baz: (config) => config['foo.bar']
    })).toEqual({
      foo: {
        bar: 'value for bar'
      },
      baz: 'value for bar'
    })
  });

  it('passes the config object in to default values', () => {
    const schema = new Schema({
      server: {
        port: {
          description: 'description',
          type: 'number',
          default: 8888
        },
        origin: {
          description: 'server origin',
          type: 'string',
          default: (config) => `localhost:${config['server.port']}`
        }
      },
      foo: {
        description: 'dummy',
        type: 'string',
        default: (config) => config['server.origin'],
      }
    });

    expect(schema.hydrate({ server: { port: 3000 } })).toEqual({
      server: {
        port: 3000,
        origin: 'localhost:3000'
      },
      foo: 'localhost:3000'
    });
  })
});

describe('parsing self referencing strings', () => {
  it('handles self references', () => {
    const schema = new Schema(selfReferencingSchema);
    expect(schema.hydrate({ baz: 'testing' })).toEqual({
      foo: {
        bar: 'testing/foo'
      },
      baz: 'testing',
      qux: 'testing/foo/testing'
    });
  });
});
