/// <reference path='../../typings/index.d.ts' />
import typecast = require('typecast');

import { TypeDefinition, Validator } from '../type';

const booleanType: TypeDefinition = {
  validate: (value: any) => {
    return typeof value === 'boolean' ? true : `Value ${value} is not a boolean`;
  },
  cast: typecast.boolean.bind(typecast),
};

export default booleanType;
