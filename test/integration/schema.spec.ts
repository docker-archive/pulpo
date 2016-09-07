import Schema from '../../src/schema';

describe('Hydrate', () => {
  it('Accepts a provided value', () => {
    const schema = new Schema({
      port: {
        type: 'number',
        default: 8888,
      },
    });

    expect(schema.hydrate({ port: 3000 })).toEqual({ port: 3000 });
  });

  it('Uses a provess.env value when no explicit value is provided', () => {
    process.env.ENV = 4000;
    const schema = new Schema({
      port: {
        type: 'number',
        default: 8888,
        env: 'ENV'
      },
    });

    expect(schema.hydrate({})).toEqual({
      port: 4000,
    });
  });

  it('falls back to default value', () => {
    const schema = new Schema({
      port: {
        type: 'number',
        default: 8888,
      },
    });

    expect(schema.hydrate({})).toEqual({ port: 8888 });
  });

  it('Throws an error if a required property is not provided', () => {
    const schema = new Schema({
      port: {
        type: 'number',
        required: true,
      },
    });
    expect(schema.hydrate.bind(schema, {})).toThrow();
  })
})
