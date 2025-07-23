import { Schema } from "mongoose";
import {
  ZodArray,
  ZodBigInt,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEnum,
  ZodMap,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRawShape,
  ZodRecord,
  ZodString,
  ZodType,
  ZodUndefined,
} from "zod/v4";
import { asyncLocalOptions } from "..";
import { NestedRecord } from "../types";
import {
  Field,
  FieldMap,
  mArray,
  mBoolean,
  mField,
  mMap,
} from "../types/mongoose";
import { _ZTM, IZtm, mergeRegex } from "./";
import {
  getFieldOptions,
  getInnerElement,
  getInnerType,
  isDefined,
  safeAccessProperty,
  stripUndefined,
} from "./common";

export const parseField = <T>(args: {
  field: ZodType<T>;
  default?: any;
  required?: boolean;
  options?: _ZTM;
}): mField => {
  const { field } = args;

  if (field instanceof ZodDefault) {
    return parseField({
      ...args,
      // Get the actual getter function, and not just the return.
      default:
        "defaultValue" in field.def
          ? Object.getOwnPropertyDescriptor(field.def, "defaultValue")?.get
          : undefined,
      field: getInnerType(field),
    });
  } else if (field instanceof ZodObject) {
    return parseObject({
      ...args,
      schema: field,
    });
  } else if (field instanceof ZodArray) {
    return parseArray({
      ...args,
      field: getInnerElement(field),
    });
  } else if (field instanceof ZodNumber || field instanceof ZodBigInt) {
    return parseNumber({
      ...args,
      field,
    });
  } else if (field instanceof ZodDate) {
    return parseDate({
      ...args,
      field,
    });
  } else if (field instanceof ZodString || field instanceof ZodEnum) {
    return parseString({
      ...args,
      field,
    });
  } else if (field instanceof ZodBoolean) {
    return parseBoolean({
      ...args,
      field: field,
    });
  } else if (field instanceof ZodOptional) {
    return parseField({
      ...args,
      field: getInnerType(field),
    });
  } else if (field instanceof ZodNullable) {
    return parseField({
      ...args,
      field: getInnerType(field),
    });
  } else if (field instanceof ZodNull || field instanceof ZodUndefined) {
    const type = field instanceof ZodUndefined ? undefined : null;

    return parseMixed({
      ...args,
      field,
      validate: {
        validator: function (value) {
          return value === type;
        },
        message: `A${["undefined"].includes(String(type)) ? "n" : ""} ${String(
          type
        )} value is required for z.${String(type)}()`,
      },
    });
  } else if (field instanceof ZodMap || field instanceof ZodRecord) {
    return parseMap({
      ...args,
      field: field.valueType as ZodType,
    });
  } else {
    return parseMixed({
      ...args,
      field,
    });
    //throw new Error("Unsupported field type: " + field._zod.def.type);
  }
};

export const parseMixed = (args: {
  field: ZodType;
  default?: any;
  required?: boolean;
  options?: IZtm["_ztm"];
  validate?: Field<any>["validate"];
}): mField => {
  const { default: def, required = true, validate, options } = args;

  return {
    ...options,
    type: Schema.Types.Mixed,
    default: def,
    required,
    validate,
  };
};

export const parseArray = <T extends ZodType>(args: {
  field: ZodType;
  default?: any[];
  required?: boolean;
  options?: _ZTM;
}): mArray<any> => {
  const { field: _field, options } = args;

  const field = parseField({
    ...args,
    options,
  });

  if (!field) throw new Error("Unsupported array type");

  return {
    ...options,
    ...args,
    ...(field as Field<T[]>),
    type: [field.type as any],
  };
};

export const parseBoolean = <T extends ZodBoolean>({
  default: def,
  options,
  ...args
}: {
  field: T;
  default?: boolean;
  required?: boolean;
  options?: _ZTM;
}): mBoolean => {
  return {
    ...args,
    ...options,
    type: Boolean,
  };
};

export const parseMap = <T, K>({
  default: def,
  required = true,
  options,
  ...args
}: {
  field: ZodType<K>;
  default?: () => Map<NoInfer<T>, K>;
  options?: _ZTM;
  required?: boolean;
}): mMap<T, K> => {
  const { field: _field } = args;

  const field = parseField({
    ...args,
    options,
  });

  return {
    ...options,
    type: Map,
    of: field as Field<K>,
    default: def,
  };
};

export const parseDate = <T extends ZodDate>({
  options,
  field,
  ...args
}: {
  field: T;
  default?: Date;
  required?: boolean;
  options?: _ZTM;
}): mField => {
  const min = field.def.checks?.find(
    (c: any) => c._zod.def.check === "greater_than"
  )?._zod?.def;

  const max = field.def.checks?.find(
    (c: any) => c._zod.def.check === "less_than"
  )?._zod?.def;

  return {
    ...args,
    ...options,
    type: Date,
    min: safeAccessProperty({
      object: min,
      key: "value",
    }) satisfies number | bigint | undefined,
    max: safeAccessProperty({
      object: max,
      key: "value",
    }) satisfies number | bigint | undefined,
  };
};

export const parseNumber = <T extends ZodNumber | ZodBigInt>({
  field,
  options,
  ...args
}: {
  field: T;
  default?: T extends ZodNumber ? number : bigint;
  required?: boolean;
  options?: _ZTM;
}): FieldMap<T> => {
  const isNumber = field instanceof ZodNumber;

  const min = field.def.checks?.find(
    (c: any) => c._zod.def.check === "greater_than"
  )?._zod?.def;

  const max = field.def.checks?.find(
    (c: any) => c._zod.def.check === "less_than"
  )?._zod?.def;

  return {
    ...options,
    ...args,
    type: isNumber ? Number : BigInt,

    min: safeAccessProperty({
      object: min,
      key: "value",
    }) satisfies number | bigint | undefined,
    max: safeAccessProperty({
      object: max,
      key: "value",
    }) satisfies number | bigint | undefined,
  } as FieldMap<T>;
};

export const parseString = <T extends ZodString | ZodEnum>({
  field,
  required = true,
  options,
  ...args
}: {
  field: T;
  unique?: boolean;
  default?: string;
  required?: boolean;
  options?: _ZTM;
}): mField => {
  const regexArray = field.def.checks
    ?.filter(
      (c: any) =>
        c._zod.def.check === "string_format" && c._zod.def.format === "regex"
    )
    .map(
      (v) =>
        safeAccessProperty({
          object: v._zod?.def,
          key: "pattern",
        }) as undefined | RegExp
    )
    .filter(isDefined); // now regexArray is RegExp[]

  return {
    ...options,
    ...args,
    type: String,

    enum: safeAccessProperty({
      object: field,
      key: "options",
    }) as string[] | undefined,

    minLength: safeAccessProperty({
      object: field.def.checks?.find(
        (c: any) => c._zod.def.check === "min_length"
      ),
      key: "min",
    }),
    maxLength: safeAccessProperty({
      object: field.def.checks?.find(
        (c: any) => c._zod.def.check === "max_length"
      ),
      key: "max",
    }),

    lowercase: Boolean(
      field.def.checks?.find(
        (c: any) =>
          c._zod.def.check === "string_format" &&
          c._zod.def.format === "lowercase"
      )
    ),
    uppercase: Boolean(
      field.def.checks?.find(
        (c: any) =>
          c._zod.def.check === "string_format" &&
          c._zod.def.format === "uppercase"
      )
    ),

    regex:
      regexArray && regexArray.length > 0 ? mergeRegex(regexArray) : undefined,
  };
};

export const parseObject = <T extends ZodRawShape>({
  ...args
}: {
  schema: ZodObject<T>;
  parentStack?: string[];
  options?: NestedRecord<_ZTM> | _ZTM;
}) => {
  const { schema: obj, parentStack = [], ...options } = args;

  const object: any = {};

  const globalOptions = asyncLocalOptions.getStore();

  for (const [key, field] of Object.entries(obj.def.shape) as [
    string,
    ZodType<any>
  ][]) {
    if (field.def.type === "object") {
      object[key] = stripUndefined(
        parseObject({
          schema: field as ZodObject<any, any>,
          parentStack: [...parentStack, key],
          ...stripUndefined(options),
        })
      );
    } else {
      const f = stripUndefined(
        parseField({
          field: field as ZodType<any>,
          options: getFieldOptions({
            properties: globalOptions,
            parentStack,
            key,
          }),
        })
      );

      object[key] = f;
    }
  }

  return object;
};
