import fs = require('fs');
import typecast = require('typecast');

import { TypeDefinition } from '../type';

const pathType: TypeDefinition = {
  validate: (value: any) => {
    try {
      fs.accessSync(value, fs.F_OK);
      return;
    } catch (e) {
      return `Value ${value} is not a valid path`;
    }
  },
  cast: typecast.string.bind(typecast),
};

export default pathType;
