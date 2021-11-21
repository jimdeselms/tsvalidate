declare module Type {
    function Named(name: string, typeParameters?: any[]): any;
    function String(value: string): any;
    function Number(value: number): any;
    function Boolean(value: boolean): any;
    function Bigint(value: bigint): any;
    function Object(types: any): any;
    function Never(): any;
    function Any(): any
    function Record(keyType, valueType): any
    function Array(arrayType): any
    function Union(...types: any[]): any
    function Intersection(...types: any[]): any
    function Optional(type: any): any
    function Literal(val: any): any
    function tsValidate<T>(result: any): void
}
