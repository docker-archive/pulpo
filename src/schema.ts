/// <reference path='../typings/index.d.ts' />

import path = require('path');
import Property from './property';
import Type, { TypeDefinition } from './type';

interface HydratedConfig {

}

interface ConfigInterface {

}

interface SchemaDefinition {

}

export default class Schema {
  definition: Object;

  static parse(definition: SchemaDefinition): Object {
    return Object.keys(definition).reduce((obj, key) => {
      obj[key] = new Property(key, definition[key]);
      return obj;
    }, {});
  }

  static addType(name: string, definition: TypeDefinition): void {
    Type.set(name, definition);
  }

  constructor(definition: SchemaDefinition) {
    this.definition = Schema.parse(definition);
  }

  hydrate(rawConfig: ConfigInterface): HydratedConfig {
    const hydratedConfig = Object.keys(this.definition).reduce((obj, key) => {
      obj[key] = this.definition[key].resolve(rawConfig);
      return obj;
    }, {});

    return hydratedConfig;
  }
}

// glob.sync(path.join(__dirname, '/types/**.js')).forEach((file) => {
//   console.log(file);
//   Schema.addType(path.basename(file, path.extname(file)), require(file));
// });

Schema.addType('number', require('./types/number'));
