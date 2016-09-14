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

interface HydratedConfig {
  [optName: string]: any;
}

function stringLookup(str: string, config: HydratedConfig): string {
  return str.replace(/(\$\{(.*)\})/gi, (match, group1, key) => {
    return dotty.get(config, key);
  });
}

function getter(config: HydratedConfig, value: any, path: string, validate: boolean): any {
  let resolvedValue: any;

  switch (typeof value) {
    case 'function':
      resolvedValue = value(config, path);
      break;
    case 'string':
      resolvedValue = stringLookup(value, config);
      break;
    default:
      resolvedValue = value;
  }

  if (validate) this.definition[path].validate(resolvedValue);
  return resolvedValue;
};

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
    const flags = {
      transform: !Reflect.has(options, 'transform') || options.transform,
      cast: !Reflect.has(options, 'cast') || options.cast,
      validate: !Reflect.has(options, 'validate') || options.validate,
    }

    // Loop over and hydrate the object with getters

    const hydratedConfig: HydratedConfig = Object.keys(this.definition).reduce((obj, key) => {
      const property = this.definition[key];

      let value = property.resolve(rawConfig);

      if (flags.transform) value = property.transform(value, rawConfig);
      if (flags.cast) value = property.cast(value);

      Object.defineProperty(obj, key, {get:  getter.bind(this, obj, value, key, flags.validate) });
      return obj
    }, {});

    return Object.keys(this.definition).reduce((obj: HydratedConfig, key: string) => {
      const value: any = hydratedConfig[key];

      if (value) dotty.put(obj, key, value);
      return obj;
    }, {});
  }
}

Schema.addType('number', numberType);
Schema.addType('string', stringType);
Schema.addType('boolean', booleanType);
Schema.addType('array', arrayType);
Schema.addType('object', objectType);
