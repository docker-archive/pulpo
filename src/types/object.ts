import typecast = require('typecast');

import { TypeDefinition, Validator } from '../type';

function isObject(value: any): boolean {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const objectType: TypeDefinition = {
  validate: (value: any) => {
    if (isObject(value)) return;
    return `Value ${value} is not a valid object`;
  },
  cast: (value) => {
    if (isObject(value)) return value;

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
};

export default objectType;
