/// <reference path='../../typings/index.d.ts' />
import Schema from '../../src/schema';

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
