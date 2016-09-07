/// <reference path='../../typings/index.d.ts' />
import typecast = require('typecast');

import { TypeDefinition, Validator } from '../type';

const booleanType: TypeDefinition = {
  validate: (value: any) => {
    if (typeof value === 'boolean') return;
    return `Value ${value} is not a boolean`;
  },
  cast: typecast.boolean.bind(typecast),
};

export default booleanType;
