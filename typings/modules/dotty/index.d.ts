interface DottyInterface {
  exists(obj: Object, key: any): boolean;
  get(obj: Object, key: any): any;
}

declare var dotty: DottyInterface;

declare module "dotty" {
  export = dotty;
}
