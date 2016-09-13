import path = require('path');
import dotty = require('dotty');

import Property, { PropertyDefinition } from './property';
import Type, { TypeDefinition } from './type';

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

export interface SchemaDefinition {
  [optName: string]: any;
}

export interface ParsedSchemaDefinition {
  [optName: string]: Property;
}

export default class Schema {
  definition: ParsedSchemaDefinition;

  static parse(rawDefinition: SchemaDefinition, startingPath?: String): ParsedSchemaDefinition {
    // 1. Loop through keys on object
    // 2. Determine if value assigned to key is a Property or a nested object
    // 3. Convert properties to Property objects
    // 4. Parse nested values recursively

    const parsedObj: ParsedSchemaDefinition = {};

    Object.keys(rawDefinition).forEach((key) => {
      const definition = rawDefinition[key];
      const fullPath = startingPath ? [startingPath, key].join('.') : key;

      if (Property.isProperty(definition)) {
        parsedObj[fullPath] = new Property(fullPath, definition);
      } else if (Property.isNested(definition)) {
        Object.assign(parsedObj, Schema.parse(definition, fullPath));
      } else {
        throw new Error(`Property definition for ${fullPath} is illegal`);
      }
    });

    return parsedObj;
  }

  static addType(name: string, definition: TypeDefinition): void {
    Type.set(name, definition);
  }

  constructor(rawDefinition: SchemaDefinition) {
    this.definition = Schema.parse(rawDefinition);
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
