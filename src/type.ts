export interface Validator { (value: any, config: Object): string | void; }

export interface TypeDefinition {
  validate: Validator;
  cast?(value: any, config: Object): any;
}

export default class Type {
  validate: Validator;
  static types: { [propName: string]: Type; } = {};

  static set(name: string, definition: TypeDefinition): void {
    Type.types[name] = new Type(name, definition);
  }

  static get(name: string): Type {
    return Type.types[name];
  }

  constructor(public name: string, public definition: TypeDefinition) {
    if (typeof definition.validate !== 'function') {
      throw new Error(`Type ${name} does not have validate method`);
    }

    this.validate = definition.validate;
  }

  cast(value: any, config: Object): any {
    const { cast } = this.definition;
    return cast ? cast(value, config) : value;
  }
}
