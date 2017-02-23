# Pulpo

Define, hydrate, and validate configurations in Node.

- **Schema**: Use JSON and JS objects to define schemas
- **Types**: Add new types with casting and validation
- **Casting, Transforms, and Validation**: Handle config values intelligently
- **Source Hierarchy**: Look for values from passed in configs, ENV variables, and CLI args
- **Self Referencing**: Reference other config values via function or string interpolation
- **Self Documenting**: Schema documentation can be generated automatically

## Getting Started

Install Pulpo with `npm` by running:

```
npm install --save pulpo
```

Getting started is as simple as importing Pulpo and passing it a JSON object for the schema and hydrating with a config object:

```js
import Pulpo from 'pulpo';

const schema = new Pulpo({
  host: {
    description: 'Host for the server',
    type: 'string',
    default: 'localhost'
  },
  port: {
    description: 'Port for dev server to run on',
    type: 'int',
    default: '3000',
    env: 'PORT'
  }
});

const config = schema.hydrate({port: 8888});

console.log(config);
// { host: 'localhost', port: 8888 }
```

Schema
---
A schema is comprised of keyed properties that are used to parse and validate configurations pulled from JSON objects, environmental variables, and command line arguments.

### Constructor

```js
import Pulpo from 'pulpo';

const schema = new Pulpo({...schema...});
```

The JSON object passed in is parsed and turned into a series of [Properties](#properties). You can also pass in nested properties:

```js
import Pulpo from 'pulpo';

const schema = new Pulpo({
  server: {
    host: {
      description: 'Host for the server',
      type: 'string',
      default: 'localhost'
    },
    port: {
      description: 'Port for dev server to run on',
      type: 'number',
      default: '3000',
      env: 'PORT'
    }
  }
});

const config = schema.hydrate({ server: { port: 8888 } });
console.log(config);
// { server: { host: 'localhost', port: 8888 } }
```

Any object keys that are in the [Property reserved key list](#properties-reserved-keys) will be parsed as part of the Property definition, and all other keys will be treated as nested Properties.

### Hydrate
Once an instance of a schema has been created, it can be used to build a config object using `schema.hydrate`:

```js
const schema = new Pulpo({...schema...});
...

const config = schema.hydrate({ server: { port: 8888 } });
```

The hydrate function will also validate the values and throw any errors.

#### Options
Hydrate also allows for a second argument to be passed in that contains options:

* transform (**default true**) - whether or not to use the property transform method on a value
* cast (**default true**) - whether or not to cast the value before validating
* validate (**default true**) - whether or not to validate a given value

#### Referencing Other Configuration Values
It is possible to reference other values in the configuration, which will be populated with resolved values found in the referenced key. This works for both **default** values and passed in values:

```js
const schema = new Pulpo({...schema...});

const config = schema.hydrate({
  server: {
    port: 8888,
    hostname: 'localhost',
    host: 'http://${server.hostname}:${server.port}'
  }
});

console.log(config.server.host);
// http://localhost:8888
```

#### Using Functions for Configuration Values
When needed, a function can be passed in as a **config** or **default** value. These functions are passed two arguments: the config object and the string path of the property being resolved:

```js
const schema = new Pulpo({...schema...});

const config = schema.hydrate({
  server: {
    port: 8888,
    hostname: 'localhost',
    host: (config) => `http://${config['server.hostname']}:${config['server.port']}`
  }
});

console.log(config.server.host);
// http://localhost:8888
```

**Note**: Configuration values are accessed through their full dot-notation strings

Properties
---
Properties are definitions for a given configuration key.

```js
import Pulpo from 'pulpo';

const schema = new Pulpo({
  environment: {
    description: 'Runtime environment',
    type: 'string',
    default: 'development',
    env: 'ENV',
    argv: 'env',
    resolve: (configObj) => configObj.env,
    transform: (value) => value.toUpperCase()
  }
});

const config = schema.hydrate({env: 'test'});
console.log(config.environment); // TEST
```

In the above example, Pulpo is doing a few things at the time of hydrate for **each** property in the schema:

1. Resolves the value in the following order, stopping once a value is found:
  1. Command line arg `--env=<value>`
  1. Process environment value `process.env.ENV`
  1. Passed in configuration object value using the given `resolve` function in the property,
     *or* the name of the property if a resolve method is not provided
  1. Default value defined in the property
1. Transforms the value if a transform method has been provided for the property
1. Casts the value using the property type provided
1. Validates that the resolved, transformed, cast value is of type defined in the property

### Definition
A property is comprised of the following keyed values:

* **description** (*required string*) - a string to define the purpose of the property
* **type** (*required string*) - a name for the type of value to be provided
* **default** (*optional value matching the type*) - the value to be used if none is provided
* **required** (*optional boolean, defaults to false*)- whether a value must be found (this is ignored if a default value is given, since a value is always provided)
* **env** (*optional string*) - the `process.env` key for looking up a property value
* **argv** (*optional string*) - the command line arg key for looking up a property value
* **resolve** (*optional function*) - a function to look up a value from a config object in a different way than using the property name

  ```js
  (configObject) => configObject.differentKey
  ```
* **transform** (*optional function*) - a function that accepts a found value and maps it to a new value (it recieves the config as a secondary argument)

  ```js
  (value, config) => parseInt(value, 10)  
  ```

### Reserved Keys
When a schema is parsed, any keys that match the [Property definition](#definition) will be automatically used in the definition of the Property. These keys cannot be used as Property names.

Types
---
Types are used to validate config values.

By default Pulpo comes with a few basic types:
* 'string'
* 'number'
* 'object'
* 'boolean'
* 'array'
* 'path'

### Adding Types
New Types can be added to Pulpo for further validation:

```js
import Pulpo from 'pulpo';

Pulpo.addType('int', {
  validate: (value, config) => {
    if (!Number.isInteger(parseFloat(value, 10)) {
      return 'Value must be of type integer';
    }
  },
  cast: (value, config) => parseFloat(value, 10),
);

...

const schema = new Pulpo({
  port: {
    ...
    type: 'int',
    ...
  }
});
```

Types are comprised of a validation function that receives a value and returns either void or an error message to be displayed to the user and a cast method that transforms a value before validating.

## Documenting

Schemas can be used to provide easy documentation for anyone interacting with the configurations:

```js
const schema = new Pulpo({
  server: {
    host: {
      description: 'Host for the server',
      type: 'string',
      default: 'localhost'
    },
    port: {
      description: 'Port for dev server to run on',
      type: 'number',
      default: '3000',
      env: 'PORT'
    }
  }
});

console.log(schema.document());
// {
//   "server.host": {
//     "description": "Host for the server",
//     "type": "string",
//     "default": "localhost"
//   },
//   "server.port": {
//     "description": "Port for dev server to run on",
//     "type": "number",
//     "default": "3000",
//     "env": "PORT"
//   }
// }
```

## License

Pulpo is licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for the full license text.
