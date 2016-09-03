export default class Field {
  static defaults = {
    requiredKeys: [
      'description',
      'default',
      'type',
    ],
    optionalKeys: [
      'validate',
      'coerce',
      'env',
      'arg',
    ],
  }

  constructor(name, definition, options = {}) {
    this.validateConstruction(name, definition, options);

    // Create local copies of definition and options
    // this._options is used for creating nested fields
    this._definition = Object.assign({}, definition);
    this._options = Object.assign({}, options);

    this.options = Object.assign({}, Field.defaults, options);
    this.name = name;

    this.reservedKeys = [
      ...this.options.requiredKeys,
      ...this.options.optionalKeys,
    ];

    this.validateName(name);
    this.parseDefinition(this._definition);
  }

  validateConstruction(name, definition, options) {
    const type = (obj) => Object.prototype.toString.call(obj);

    if (typeof name !== 'string') {
      throw new Error('Field name must be a string');
    }

    if (type(definition) !== '[object Object]') {
      throw new Error(`Definition for field ${name} must be an object`);
    }

    if (options && type(options) !== '[object Object]') {
      throw new Error(`Options for field ${name} must be an object`);
    }

    if (options && options.requiredKeys &&
      type(options.requiredKeys) !== '[object Array]') {
      throw new Error(
        `Required keys option for field ${name} must be an array`
      );
    }

    if (options && options.optionalKeys &&
      type(options.optionalKeys) !== '[object Array]') {
      throw new Error(
        `Optional keys option for field ${this.name} must be an array`
      );
    }
  }

  validateName(name) {
    if (~this.reservedKeys.indexOf(name)) {
      throw new Error(`Field name ${name} is a reserved key`);
    }
  }

  parseDefinition(definition) {
    this.validateDefinition(definition);
    const { schema, nested } = this.extractDefinitionValues(definition);

    this.schema = schema;
    this.nested = nested;
  }

  validateDefinition(definition) {
    const missing = this.options.requiredKeys.filter(
      (key) => !Reflect.has(definition, key)
    );

    if (missing.length) {
      throw new Error(
        `Field ${this.name} missing required keys: ${missing.join(', ')}`
      );
    }
  }

  extractDefinitionValues(definition) {
    const schema = {};
    const nested = {};

    Object.keys(definition).forEach((key) => {
      if (this.reservedKeys.indexOf(key) !== -1) {
        schema[key] = definition[key];
      } else {
        nested[key] = new Field(key, definition[key], this._options);
      }
    });

    return { schema, nested };
  }
}
