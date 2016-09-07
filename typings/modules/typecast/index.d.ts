interface TypecastInteface {
  number(value: any): number;
}

declare var typecast: TypecastInteface;

declare module "typecast" {
  export = typecast;
}
