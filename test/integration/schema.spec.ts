/// <reference path='../../typings/index.d.ts' />
import Schema from '../../src/schema';
import nestedSchema = require('../fixtures/nested-schema.json');
import brokenNestedSchema = require('../fixtures/broken-nested-schema.json');
import selfReferencingSchema = require('../fixtures/self-referencing-schema.json');

describe('Resolve', () => {
  it('Accepts a provided value', () => {
    const schema = new Schema({
      port: {
        description: 'description',
        type: 'number',
        default: 8888
      },
    });

    expect(schema.hydrate({ port: 3000 })).toEqual({ port: 3000 });
  });

  it('Uses a process.env value when provided', () => {
    process.env.PORT = 4000;
    const schema = new Schema({
      port: {
        description: 'description',
        type: 'number',
        default: 8888,
        env: 'PORT'
      },
    });

    expect(schema.hydrate({port: 3000})).toEqual({
      port: 4000,
    });
  });

  it('Uses a cli arg when provided', () => {
    const argv = process.argv;
    process.env.PORT = 4000;
    process.argv = ['--port', '5000'];

    const schema = new Schema({
      port: {
        description: 'description',
        type: 'number',
        default: 8888,
        env: 'PORT',
        argv: 'port'
      },
    });

    expect(schema.hydrate({ port: 3000 })).toEqual({ port: 5000 });

    process.argv = argv;
  });

  it('falls back to default value', () => {
    const schema = new Schema({
      port: {
        description: 'description',
        type: 'number',
        default: 8888,
      },
    });

    expect(schema.hydrate({})).toEqual({ port: 8888 });
  });
});

describe('Transform', () => {
  it('transforms the value using a given property definition', () => {
    const schema = new Schema({
      origin: {
        description: 'description',
        type: 'string',
        transform: (value) => value.join(':'),
      }
    });

    const bound = schema.hydrate.bind(
      schema,
      { origin: ['localhost', 8888] },
      { cast: false }
    );

    expect(bound).not.toThrow();
    expect(bound()).toEqual({ origin: 'localhost:8888' });
  })
});

describe('Cast and Validate', () => {
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
