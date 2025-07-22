import type {
  SchemaDefinition,
  SchemaTypeOptions,
  SchemaTypes,
  Types,
} from "mongoose";
import {
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodNumber,
  ZodString,
  type ZodType,
} from "zod/v4";

export interface Field<T> {
  required?: boolean;
  default?: T | (() => T);
  validate?: {
    validator: (v: T) => boolean;
    message?: string;
  };
}

export interface mString extends Field<string> {
  type: StringConstructor;
  unique?: boolean;

  enum?: string[];

  match?: RegExp;
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  regex?: RegExp;

  minLength?: number;
  maxLength?: number;
}

export interface mNumber extends Field<number> {
  type: NumberConstructor;
  unique?: boolean;
  min?: number;
  max?: number;
}

export interface mBigInt extends Field<bigint> {
  type: BigIntConstructor;
  unique?: boolean;
  min?: number;
  max?: number;
}

export interface mBoolean extends Field<boolean> {
  type: BooleanConstructor;
}

export interface mDate extends Field<Date> {
  type: DateConstructor;
  unique?: boolean;

  min?: Date;
  max?: Date;
  expires?: Date;
}

export interface mObjectId extends Field<Types.ObjectId> {
  type: typeof SchemaTypes.ObjectId;
  unique?: boolean;
  ref?: string;
  refPath?: string;
}

export interface mUUID extends Field<Types.UUID> {
  type: typeof SchemaTypes.UUID;
  unique?: boolean;
  ref?: string;
  refPath?: string;
}

export interface mArray<K> extends Field<K[]> {
  type: [Field<K>];
}

export interface mMixed<T> extends Field<T> {
  type: typeof SchemaTypes.Mixed;
}

export interface mMap<T, K> extends Field<Map<T, K>> {
  type: typeof Map;
  of?: Field<K>;
}

// Only works with primitives (including date)
export type FieldMap<T> = T extends ZodString
  ? mString
  : T extends ZodNumber
  ? mNumber
  : T extends ZodBigInt
  ? mBigInt
  : T extends ZodBoolean
  ? mBoolean
  : T extends ZodDate
  ? mDate
  : unknown;

export type mField =
  // Primitives
  | mString
  | mNumber
  | mBigInt
  | mBoolean
  | mDate
  // Mixed types
  | mMixed<unknown>
  | mArray<unknown>
  | mMap<unknown, unknown>;

export type _Schema<T> = SchemaDefinition & {
  [K in keyof T]: (Field<T[K]> & SchemaTypeOptions<T[K]>) | _Schema<T[K]>;
};

export type UnwrapZodType<T> = T extends ZodType<infer K> ? K : never;

export type EffectValidator<T> = {
  validator: (v: T) => boolean;
  message?: string;
};
