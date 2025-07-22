import type { ZodObject, ZodRawShape } from "zod/v4";
import { _ZTM, IZtm } from "../utils/ztm";

export type NestedRecord<T> = { [key: string]: NestedRecord<T> | T };

export type PropertyAtPath<T, K extends readonly string[]> = K extends [
  infer Head,
  ...infer Tail
]
  ? Head extends keyof T
    ? Tail extends []
      ? T[Head]
      : Tail extends readonly string[]
      ? PropertyAtPath<T[Head], Tail>
      : undefined
    : undefined
  : T;

export type NestedOptions<TShape extends ZodRawShape, TValue> = {
  [K in keyof TShape]?: TShape[K] extends ZodObject<infer InnerShape>
    ? NestedOptions<InnerShape, TValue>
    : TValue;
};

type FlexibleOptionType = IZtm | _ZTM;

type StrictSchemaOptions<T extends ZodRawShape> = {
  [K in keyof T]?: T[K] extends ZodObject<infer InnerShape>
    ? StrictSchemaOptions<InnerShape> // Nested objects recursively allow same flexibility
    : FlexibleOptionType; // At leaf nodes: IZtm or _ZTM object
};

/**
 * SchemaOptions now:
 * - Must match schema shape.
 * - Cannot invent keys.
 * - Allows partial (optional modification).
 */
export type SchemaOptions<T extends ZodRawShape> = StrictSchemaOptions<T>;

export type Paths = string[] | NestedRecord<boolean>;

export interface IParseObject<T extends ZodRawShape> {
  schema: ZodObject<T>;

  // Booleans
  options?: SchemaOptions<T>;

  // An array that keeps track of all the parent paths
  // To be able to build the full path
  parentStack?: string[];
}
export interface IGenerateSchema<T extends ZodRawShape>
  extends Omit<IParseObject<T>, "parentStack"> {}
