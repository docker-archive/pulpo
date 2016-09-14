interface DottyInterface {
  exists(obj: Object, key: any): boolean;
  get(obj: Object, key: Array<string> | string): any;
  put(obj: Object, key: Array<string> | string, value: any): void;
  deepKeys(obj: Object): Array<Array<string>>;
}

declare var dotty: DottyInterface;

declare module "dotty" {
  export = dotty;
}
