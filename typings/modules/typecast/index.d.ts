interface TypecastInteface {
  number(value: any): number;
  string(value: any): string;
  boolean(value: any): boolean;
}

declare var typecast: TypecastInteface;

declare module "typecast" {
  export = typecast;
}
