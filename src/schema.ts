/// <reference path='../typings/index.d.ts' />

import path = require('path');
import dotty = require('dotty');

import Property, { PropertyDefinition } from './property';
import Type, { TypeDefinition } from './type';

import numberType from './types/number';
import booleanType from './types/boolean';
import stringType from './types/string';
import arrayType from './types/array';
import objectType from './types/object';

interface HydrateOptionsDefinition {
  transform?: boolean;
  cast?: boolean;
  validate?: boolean;
}

interface SchemaDefinition {
  [optName: string]: PropertyDefinition;
}

export default class Schema {
  definition: Object;
  keys: Array<string>;

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
    this.keys = Object.keys(this.definition);
  }

  hydrate(rawConfig: Object, options: HydrateOptionsDefinition = {}): Object {
    const hydratedConfig = this.keys.reduce((obj, key) => {
      const property = dotty.get(this.definition, key);

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
