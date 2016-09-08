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

function isDefined(value: any): boolean {
  return value !== undefined && value !== null;
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
      if (isDefined(rawValue)) return rawValue;
    }

    if (env && Reflect.has(process.env, env)) {
      rawValue = process.env[env];
      if (isDefined(rawValue)) return rawValue;
    }

    if (resolve) {
      rawValue = resolve(rawConfig);
      if (isDefined(rawValue)) return rawValue;
    }

    if (dotty.exists(rawConfig, this.path)) {
      rawValue = dotty.get(rawConfig, this.path);
      if (isDefined(rawValue)) return rawValue;
    }

    return this.definition.default;
  }

  cast(value: any): any {
    return (!isDefined(value)) ? value : this.type.cast(value);
  }

  transform(value: any): any {
    if (!isDefined(value)) return value;
    return this.definition.transform ? this.definition.transform(value) : value;
  }

  validate(value: any): void {
    if ((!isDefined(value)) && this.definition.required) {
      throw new Error(`${this.path} is a required parameter but no value was provided`);
    }

    const typeError: void | string = this.type.validate(value);
    if (isDefined(typeError)) throw new Error(`${this.path}: ${typeError}`);
  }
}
