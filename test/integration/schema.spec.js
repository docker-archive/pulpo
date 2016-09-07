"use strict";
var schema_1 = require('../../src/schema');
describe('Resolve', function () {
    it('Accepts a provided value', function () {
        var schema = new schema_1.default({
            port: {
                description: 'description',
                type: 'number',
                default: 8888
            },
        });
        expect(schema.hydrate({ port: 3000 })).toEqual({ port: 3000 });
    });
    it('Uses a process.env value when provided', function () {
        process.env.PORT = 4000;
        var schema = new schema_1.default({
            port: {
                description: 'description',
                type: 'number',
                default: 8888,
                env: 'PORT'
            },
        });
        expect(schema.hydrate({ port: 3000 })).toEqual({
            port: 4000,
        });
    });
    it('Uses a cli arg when provided', function () {
        var argv = process.argv;
        process.env.PORT = 4000;
        process.argv = ['--port', '5000'];
        var schema = new schema_1.default({
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
    it('falls back to default value', function () {
        var schema = new schema_1.default({
            port: {
                description: 'description',
                type: 'number',
                default: 8888,
            },
        });
        expect(schema.hydrate({})).toEqual({ port: 8888 });
    });
});
describe('Coerce', function () {
    it('coerces the value using a given property definition', function () {
        var schema = new schema_1.default({
            origin: {
                description: 'description',
                type: 'string',
                coerce: function (value) { return value.join(':'); },
            }
        });
        var bound = schema.hydrate.bind(schema, { origin: ['localhost', 8888] }, { cast: false });
        expect(bound).not.toThrow();
        expect(bound()).toEqual({ origin: 'localhost:8888' });
    });
});
describe('Cast and Validate', function () {
    it('throws when wrong type provided', function () {
        var schema = new schema_1.default({
            port: {
                description: 'description',
                type: 'number',
                default: 8888,
            },
            name: {
                description: 'description',
                type: 'string',
                default: 'foo',
            },
            test: {
                description: 'description',
                type: 'boolean',
                default: false,
            },
        });
        expect(schema.hydrate.bind(schema, { port: 'foo' }, { cast: false })).toThrow();
        expect(schema.hydrate.bind(schema, { port: '3000' })).not.toThrow();
        expect(schema.hydrate.bind(schema, { port: 3000 }, { cast: false })).not.toThrow();
        expect(schema.hydrate.bind(schema, { name: {} }, { cast: false })).toThrow();
        expect(schema.hydrate.bind(schema, { name: 1 })).not.toThrow();
        expect(schema.hydrate.bind(schema, { name: 'bar' }, { cast: false })).not.toThrow();
        expect(schema.hydrate.bind(schema, { test: {} }, { cast: false })).toThrow();
        expect(schema.hydrate.bind(schema, { test: 1 })).not.toThrow();
        expect(schema.hydrate.bind(schema, { test: false }, { cast: false })).not.toThrow();
    });
});
