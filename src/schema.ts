import path = require('path');
import dotty = require('dotty');

import Property, { PropertyDefinition } from './property';
import Type, { TypeDefinition } from './type';
import parse from './parser';

import numberType from './types/number';
import booleanType from './types/boolean';
import stringType from './types/string';
import arrayType from './types/array';
import objectType from './types/object';

export interface HydrateOptionsDefinition {
  transform?: boolean;
  cast?: boolean;
  validate?: boolean;
}

export default class Schema {
  definition: Object;

  static addType(name: string, definition: TypeDefinition): void {
    Type.set(name, definition);
  }

  constructor(rawDefinition: Object) {
    this.definition = parse(rawDefinition);
  }

  hydrate(rawConfig: Object, options: HydrateOptionsDefinition = {}): Object {
    const hydratedConfig = Object.keys(this.definition).reduce((obj, key) => {
      const property = this.definition[key];

      let value = property.resolve(rawConfig);

      if (!Reflect.has(options, 'transform') || options.transform) {
        value = property.transform(value, rawConfig);
      }

      if (!Reflect.has(options, 'cast') || options.cast) {
        value = property.cast(value);
      }

      if (!Reflect.has(options, 'validate') || options.validate) {
        property.validate(value);
      }

      dotty.put(obj, key, value);
      return obj;
    }, {});

    return hydratedConfig;
  }
}

Schema.addType('number', numberType);
Schema.addType('string', stringType);
Schema.addType('boolean', booleanType);
Schema.addType('array', arrayType);
Schema.addType('object', objectType);
