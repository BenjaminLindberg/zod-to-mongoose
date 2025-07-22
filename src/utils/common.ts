import { ZodRawShape, ZodType } from "zod/v4";
import { NestedRecord, Paths, PropertyAtPath, SchemaOptions } from "../types";
import { _ZTM, isZtm } from "./ztm";

export const getInnerType = (field: ZodType<any>): ZodType<any> => {
  return ("innerType" in field.def && field.def.innerType) as ZodType<any>;
};

export const getInnerElement = (field: ZodType<any>): ZodType<any> => {
  return ("element" in field && field.element) as ZodType<any>;
};

// Check if value is defined, and reinforce the TS typings.
export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null;
};

export function safeAccessProperty<
  O extends object,
  K extends PropertyKey
>(params: {
  object: O | null | undefined;
  key: K;
}): O[K & keyof O] | undefined {
  const { object, key } = params;

  if (typeof object !== "object" || object === null) return undefined;

  if (key in object) {
    return (object as any)[key];
  }

  return undefined;
}

export const getFieldHasOption = ({
  properties,
  parentStack,
  key,
}: {
  properties: Paths | undefined;
  parentStack: string[];
  key: string;
}) =>
  typeof properties !== "undefined" &&
  (Array.isArray(properties)
    ? properties.includes(parentStack.concat(key).join("."))
    : Boolean(
        getFlattenedProperty({
          key: parentStack.concat(key),
          object: parentStack,
        })
      ));

export const getFlattenedProperty = <
  T extends object,
  K extends readonly string[]
>({
  object,
  key,
}: {
  object: T;
  key: K;
}): PropertyAtPath<T, K> | undefined => {
  if (!object) return undefined;

  const keys = key;

  let item: unknown = object;

  for (const k of keys) {
    if (item === null || item === undefined || typeof item !== "object") {
      return undefined;
    }

    item = (item as Record<string, unknown>)[k];
  }

  return item as PropertyAtPath<T, K>; //
};

export const getFieldOptions = <T>({
  properties,
  parentStack,
  key,
}: {
  properties: NestedRecord<T> | undefined;
  parentStack: string[];
  key: string;
}): _ZTM => {
  if (!properties) return {};

  const fullKey = parentStack.concat(key);

  return (
    getFlattenedProperty({
      key: fullKey,
      object: properties,
    }) || {}
  );
};

export const normalizeOptions = <T extends ZodRawShape>(
  options?: SchemaOptions<T>
) => {
  let object: any = {};

  if (!options) return object;

  Object.entries(options).forEach(([key, value]) => {
    if (isZtm(value)) {
      object[key] = value._ztm;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      object[key] = normalizeOptions(value as any); // Recursively normalize nested objects
    } else {
      object[key] = value;
    }
  });

  return object;
};
