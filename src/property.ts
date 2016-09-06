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

}

class Property implements PropertyInterface {
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

  constructor(public name: string, public definition: PropertyDefinition) {

  }
}
