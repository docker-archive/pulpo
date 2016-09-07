import typecast = require('typecast');

import { TypeDefinition, Validator } from '../type';

const arrayType: TypeDefinition = {
  validate: (value: any) => {
    if (Object.prototype.toString.call(value) === '[object Array]') return;
    return `Value ${value} is not an array`;
  },
  cast: typecast.array.bind(typecast),
};

export default arrayType;
