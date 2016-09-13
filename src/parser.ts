
import Property, { PropertyDefinition } from './property';

export interface ParsedSchemaDefinition {
  [optName: string]: Property;
}

export default function parse(rawDefinition: Object, startingPath?: String): ParsedSchemaDefinition {
  // 1. Loop through keys on object
  // 2. Determine if value assigned to key is a Property or a nested object
  // 3. Convert properties to Property objects
  // 4. Parse nested values recursively

  const parsedObj = {};

  Object.keys(rawDefinition).forEach((key) => {
    const definition = rawDefinition[key];
    const fullPath = startingPath ? [startingPath, key].join('.') : key;

    if (Property.isProperty(definition)) {
      parsedObj[fullPath] = new Property(fullPath, definition);
    } else if (Property.isNested(definition)) {
      Object.assign(parsedObj, parse(definition, fullPath));
    } else {
      throw new Error(`Property definition for ${fullPath} is illegal`);
    }
  });

  return parsedObj;
}
