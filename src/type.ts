interface Validator { (value: any): string | boolean; }
interface TypeInterface { name: string; validate: Validator; }

export default class Type implements TypeInterface {
  static types: { [propName: string]: Type; } = {};

  static set(name: string, validate: Validator): void {
    Type.types[name] = new Type(name, validate);
  }

  static get(name: string): Type {
    return Type.types[name];
  }

  constructor(public name: string, public validate: Validator) {
  }
}
