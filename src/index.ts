import { AsyncLocalStorage } from "node:async_hooks";
import { ZodObject } from "zod";
import { ZodRawShape } from "zod/v4";
import { IGenerateSchema, SchemaOptions } from "./types";
import { _Schema } from "./types/mongoose";
import { normalizeOptions } from "./utils";
import { parseObject } from "./utils/parsers";

export const asyncLocalOptions = new AsyncLocalStorage<
  SchemaOptions<ZodRawShape>
>();

export const generateRawSchema = <T extends ZodRawShape>({
  schema,
  ...props
}: IGenerateSchema<T>): _Schema<T> => {
  if (!(schema instanceof ZodObject)) {
    throw new Error("Schema is not a valid zod object.");
  }
  return asyncLocalOptions.run(normalizeOptions(props.options), () => {
    return parseObject({
      schema,
      ...props,
    });
  });
};
