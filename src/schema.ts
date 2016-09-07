/// <reference path='../typings/index.d.ts' />

import numberType from './types/number';
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

Schema.addType('number', numberType);
