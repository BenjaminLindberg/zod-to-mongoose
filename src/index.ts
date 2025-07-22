import { AsyncLocalStorage } from "node:async_hooks";
import { ZodRawShape } from "zod/v4";
import { IGenerateSchema } from "./types";
import { _Schema } from "./types/mongoose";
import { normalizeOptions } from "./utils";
import { parseObject } from "./utils/parsers";

export const asyncLocalOptions = new AsyncLocalStorage<
  IGenerateSchema<ZodRawShape>["options"]
>();

export const generateRawSchema = <T extends ZodRawShape>({
  ...props
}: IGenerateSchema<T>): _Schema<T> => {
  return asyncLocalOptions.run(normalizeOptions(props.options), () => {
    return parseObject({
      ...props,
    });
  });
};
