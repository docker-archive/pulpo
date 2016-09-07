import Type from './type';

interface PropertyDefinition {
  description: string;
  type: string;
  default?: any;
  required?: boolean;
  env?: string;
  argv?: string;
  resolve?(config: Object): any;
  coerce?(value: any): any;
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
    const rawValue = rawConfig[this.path] ||
      process.env[this.definition.env] ||
      this.definition.default;

    return this.type.cast(rawValue);
  }
}
