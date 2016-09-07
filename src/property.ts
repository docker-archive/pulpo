import dotty = require('dotty');
import yargs = require('yargs');
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

    let rawValue;

    // Use yargs.parse here to make sure we have a clean parsing of the CLI
    const parsedArgs = yargs.parse(process.argv);

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
    return this.type.cast(value);
  }

  transform(value: any): any {
    return this.definition.transform ? this.definition.transform(value) : value;
  }

  validate(value: any): void {
    const error: void | string = this.type.validate(value);
    if (error === undefined) return;
    throw new Error(`${this.path}: ${error}`);
  }
}
