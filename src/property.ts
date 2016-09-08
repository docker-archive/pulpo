import dotty = require('dotty');
import minimist = require('minimist');
import Type from './type';

export interface PropertyDefinition {
  description: string;
  type: string;
  default?: any;
  required?: boolean;
  env?: string;
  argv?: string;
  resolve?(config: Object): any;
  transform?(value: any): any;
}

export default class Property {
  type: Type;
  static reservedKeys: Array<string> = [
    'description',
    'type',
    'default',
    'required',
    'env',
    'argv',
    'resolve',
    'transform'
  ];

  constructor(public path: string, public definition: PropertyDefinition) {
    this.type = Type.get(definition.type);
  }

  resolve(rawConfig: Object): any {
    const { resolve, argv, env, type } = this.definition;

    let rawValue: any;

    // Use minimist here to make sure we have a clean parsing of the CLI
    const parsedArgs = minimist(process.argv);

    if (argv && Reflect.has(parsedArgs, argv)) {
      rawValue = parsedArgs[argv];
    } else if (env && Reflect.has(process.env, env)) {
      rawValue = process.env[env];
    } else if (resolve) {
      rawValue = resolve(rawConfig);
    } else if (dotty.exists(rawConfig, this.path)) {
      rawValue = dotty.get(rawConfig, this.path);
    } else {
      rawValue = this.definition.default;
    }

    return rawValue;
  }

  cast(value: any): any {
    return (value === undefined) ? value : this.type.cast(value);
  }

  transform(value: any): any {
    if (value === undefined) return value;
    return this.definition.transform ? this.definition.transform(value) : value;
  }

  validate(value: any): void {
    if ((value === undefined || value === null) && this.definition.required) {
      throw new Error(`${this.path} is a required parameter but no value was provided`);
    }

    const typeError: void | string = this.type.validate(value);
    if (typeError !== undefined) throw new Error(`${this.path}: ${typeError}`);
  }
}
