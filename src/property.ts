import dotty = require('dotty');
import yargs = require('yargs');
import Type from './type';

interface PropertyDefinition {
  description: string;
  type: string;
  default?: any;
  required?: boolean;
  env?: string;
  argv?: string;
  resolve?(config: Object): any;
}

interface PropertyInterface {
  resolve(config: Object): any;
}

export default class Property implements PropertyInterface {
  type: Type;
  static reservedKeys: Array<string> = [
    'description',
    'type',
    'default',
    'required',
    'env',
    'argv',
    'resolve',
    'coerce'
  ];

  constructor(public path: string, public definition: PropertyDefinition) {
    this.type = Type.get(definition.type);
  }

  resolve(rawConfig: Object): any {
    const { resolve, argv, env, type } = this.definition;

    let rawValue;

    if (argv && Reflect.has(yargs.argv, argv)) {
      rawValue = yargs[argv];
    } else if (env && Reflect.has(process.env, env)) {
      rawValue = process.env[env];
    } else if (resolve) {
      rawValue = resolve(rawConfig);
    } else if (dotty.exists(rawConfig, this.path)) {
      rawValue = dotty.get(rawConfig, this.path);
    } else {
      rawValue = this.definition.default;
    }

    return rawValue !== undefined ? this.type.cast(rawValue) : rawValue;
  }

  validate(value: any) {

  }
}
