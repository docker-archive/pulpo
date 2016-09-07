export interface Validator { (value: any): string | boolean; }
export interface TypeDefinition {
  validate: Validator;
  cast(value: any): any;
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
    this.validate = definition.validate;
  }

  cast(value: any): any {

  }
}
