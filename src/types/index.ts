import type { ZodObject, ZodRawShape } from "zod/v4";
import { _ZTM, IZtm } from "../utils/ztm";

type Decrement = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // up to 10 levels

export type NestedRecord<T, Depth extends number = 10> = Depth extends 0
  ? T
  : { [key: string]: NestedRecord<T, Decrement[Depth]> | T };

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
export type NestedOptions<
  TShape extends ZodRawShape,
  TValue,
  Depth extends number = 10
> = Depth extends 0
  ? TValue
  : {
      [K in keyof TShape]?: TShape[K] extends ZodObject<infer InnerShape>
        ? NestedOptions<InnerShape, TValue, Decrement[Depth]>
        : TValue;
    };

type FlexibleOptionType = IZtm | _ZTM;

type StrictSchemaOptions<
  T extends ZodRawShape,
  Depth extends number = 10 // Limit recursion to 10 levels
> = Depth extends 0
  ? unknown
  : {
      [K in keyof T]?: T[K] extends ZodObject<infer InnerShape>
        ? StrictSchemaOptions<InnerShape, Decrement[Depth]>
        : FlexibleOptionType;
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
  // Use any to avoid infinite instantiation
  schema: unknown;

  // Booleans
  options?: SchemaOptions<T>;

  // An array that keeps track of all the parent paths
  // To be able to build the full path
  parentStack?: string[];
}

export interface IGenerateSchema<T extends ZodRawShape>
  extends Omit<IParseObject<T>, "parentStack"> {}
