/// <reference path='../../typings/index.d.ts' />
import Schema from '../../src/schema';

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
  });

  it('accepts a raw config object as a second argument', () => {
    const schema = new Schema({
      foo: {
        description: 'description',
        type: 'string',
        transform: (value, config) => [value, config.bar].join(':')
      },
      bar: {
        description: 'description',
        type: 'string',
        required: true,
        transform: (value) => value.trim()
      }
    });

    expect(schema.hydrate({ bar: ' baz ', foo: 'qux' })).toEqual({
      foo: 'qux:baz',
      bar: 'baz'
    });
  });
});
