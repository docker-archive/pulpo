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
  transform?(value: any, config: Object): any;
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

  static requiredKeys: Array<string> = [
    'description',
    'type'
  ];

  static isProperty(obj: Object): boolean {
    // Every key in object is a Property key
    // AND
    // Every required key is present
    return Object.keys(obj).every(
      (key) => !!~Property.reservedKeys.indexOf(key)
    ) && Property.requiredKeys.every(
      (key) => Reflect.has(obj, key)
    );
  }

  static isNested(obj: Object): boolean {
    return Object.keys(obj).every(
      (key) => !~Property.reservedKeys.indexOf(key)
    );
  }

  constructor(public path: string, public definition: PropertyDefinition) {
    if (!Property.isProperty(definition)) {
      throw new Error(`Property definition for ${path} is not a valid property`);
    }

    const name = path.split('.').pop();
    if (~Property.reservedKeys.indexOf(name)) {
      throw new Error(`Property name ${name} is reserved`);
    }

    const type = Type.get(definition.type);
    if (!type) {
      throw new Error(`Property type for ${path} is not a valid type`);
    }

    this.type = type;
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

  cast(value: any, config: Object): any {
    return (!isDefined(value)) ? value : this.type.cast(value, config);
  }

  transform(value: any, rawConfig: Object): any {
    if (!(isDefined(value) && this.definition.transform)) return value;
    return this.definition.transform(value, rawConfig);
  }

  validate(value: any, config: Object): void {
    const defined = isDefined(value);

    if ((!defined) && this.definition.required) {
      throw new Error(`${this.path} is a required parameter but no value was provided`);
    } else if (!defined) {
      return;
    }

    const typeError: void | string = this.type.validate(value, config);
    if (isDefined(typeError)) throw new Error(`${this.path}: ${typeError}`);
  }
}
