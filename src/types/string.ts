/// <reference path='../../typings/index.d.ts' />
import typecast = require('typecast');

import { TypeDefinition, Validator } from '../type';

const stringType: TypeDefinition = {
  validate: (value: any) => {
    console.log(value, typeof value);
    if (typeof value === 'string') return;
    return `Value ${value} is not a string`;
  },
  cast: typecast.string.bind(typecast),
};

export default stringType;
