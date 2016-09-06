Pulpo
---

Validate and build configurations in Node.

- **Static Schema**: Use JSON to define schemas for configuration 

- **Extensible and Configurable**: Pulpo provides an easy interface for defining types, resolving configurations, coercing values, and allowing CLI overrides.

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
    description: 'Port for dev server to run on'
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
      description: 'Port for dev server to run on'
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
const schema = new Schema({...schema...});
...

const config = schema.hydrate({ server: { port: 8888 } });
```

The hydrate function will also validate the values and throw any errors.

Properties
---
Properties are definitions for a given configuration key.

```js
import Pulpo from 'pulpo';

const schema = new Schema({
  environment: {
    description: 'Runtime environment',
    type: 'string',
    default: 'development',
    env: 'ENV',
    argv: 'env',
    resolve: (configObj) => configObj.env
  }
});

const config = schema.hydrate({env: 'test'});
console.log(config.environment); // test
```

In the above example, Pulpo is doing a few things at the time of hydrate:

1. Parses the JSON configuration to create
1. Uses the `environment.resolve` function to look up the value off the config object
1. Resolves the value in the following order, stopping once a value is found:
  1. Command line arg `--env=<value>`
  1. Process environment value `process.env.ENV`
  1. Configuration object value using the given `resolve` function, or the name of the property if a resolve method is not provided
  1. Default value
1. Validates that the value is of type `string`

### Definition
A property is comprised of the following keyed values:

* **description** (*required string*) - a to define the purpose of the property
* **type** (*required string*) - a name for the type of value to be provided
* **default** (*optional value matching the type*) - the value to be used if none is provided
* **required** (*optional boolean, defaults to false*)- whether a value must be found (this is ignored if a default value is given, since a value is always provided)
* **env** (*optional string*) - the `process.env` key for looking up a property value
* **argv** (*optional string*) - the command line arg key for looking up a property value
* **resolve** (*optional function*) - a function to look up a value from a config object in a different way than using the property name

  ```js
  (configObject) => configObject.differentKey
  ```
* **transform** (*optional function*) - a function that accepts a found value and maps it to a new value
  ```js
  (value) => parseInt(value, 10)  
  ```

### Reserved Keys
When a schema is parsed, any keys that match the [Property options](#Options) will be automatically used in the definition of the Property. These keys cannot be used as Property names.

Types
---
Types are used to validate config values. By default Pulpo comes with basic primitive types:
* 'string'
* 'number'
* 'object'
* 'function'
* 'boolean'

### Adding Types
New Types can be added to Pulpo for further validation:

```js
import Pulpo from 'pulpo';

Pulpo.addType('int', (value) => {
  if (!Number.isInteger(parseFloat(value, 10)) {
    return 'Value must be of type integer';
  }

  return true;
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

Types are a validation function that receives a value and returns either the boolean value `true` or an error message to be displayed to the user.

