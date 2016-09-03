import FieldFormat from './field-format';
import Field from './field';

export default class Schema {
  static defaults = {}
  static fieldFormats = {}

  static addFieldFormat(name, format) {
    if (Schema.fieldFormats[name]) {
      throw new Error(`Field format ${name} already exists`);
    }

    Schema.fieldFormats[name] = new FieldFormat(format);
  }

  constructor(rawSchema, options = {}) {
    this.options = Object.assign({}, Schema.defaults, options);
    if (rawSchema) this.load(rawSchema);
  }

  load(rawSchema) {
    if (this.schema) throw new Error('Schema already loaded');

    this.fields = Object.keys(rawSchema).reduce((fields, key) => {
      // eslint-disable-next-line no-param-reassign
      fields[key] = new Field(key, rawSchema[key], this.options);
      return fields;
    }, {});
  }
}
