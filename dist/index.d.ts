import * as z from 'zod/v4';
import { ZodRawShape, ZodObject } from 'zod/v4';
import { SchemaDefinition, SchemaTypeOptions } from 'mongoose';
import { AsyncLocalStorage } from 'node:async_hooks';

type ZtmTransform = (v: any) => any;
interface _ZTM {
    type?: "ObjectID" | "UUID";
    unique?: boolean;
    sparse?: boolean;
    index?: boolean;
    immutable?: boolean;
    ref?: string;
    refPath?: string;
    get?: ZtmTransform;
    set?: ZtmTransform;
}
interface IZtm {
    _ztm: _ZTM;
    unique(): IZtm;
    sparse(): IZtm;
    index(): IZtm;
    immutable(): IZtm;
    ref(ref: string): IZtm;
    refPath(refPath: string): IZtm;
    get(transform: ZtmTransform): IZtm;
    set(transform: ZtmTransform): IZtm;
    uuid(): IZtm;
    id(): IZtm;
}

type FlexibleOptionType = IZtm | _ZTM;
type StrictSchemaOptions<T extends ZodRawShape> = {
    [K in keyof T]?: T[K] extends ZodObject<infer InnerShape> ? StrictSchemaOptions<InnerShape> : FlexibleOptionType;
};
/**
 * SchemaOptions now:
 * - Must match schema shape.
 * - Cannot invent keys.
 * - Allows partial (optional modification).
 */
type SchemaOptions<T extends ZodRawShape> = StrictSchemaOptions<T>;
interface IParseObject<T extends ZodRawShape> {
    schema: ZodObject<T>;
    options?: SchemaOptions<T>;
    parentStack?: string[];
}
interface IGenerateSchema<T extends ZodRawShape> extends Omit<IParseObject<T>, "parentStack"> {
}

interface Field<T> {
    required?: boolean;
    default?: T | (() => T);
    validate?: {
        validator: (v: T) => boolean;
        message?: string;
    };
}
type _Schema<T> = SchemaDefinition & {
    [K in keyof T]: (Field<T[K]> & SchemaTypeOptions<T[K]>) | _Schema<T[K]>;
};

declare const schema: z.ZodObject<{
    test2: z.ZodObject<{
        t: z.ZodDefault<z.ZodString>;
        t2: z.ZodString;
    }, z.core.$strip>;
    k: z.ZodNull;
    abc: z.ZodRecord<z.ZodString, z.ZodObject<{
        test: z.ZodString;
    }, z.core.$strip>>;
    tae: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    d: z.ZodDate;
    k3: z.ZodNumber;
}, z.core.$strip>;
declare const asyncLocalOptions: AsyncLocalStorage<{
    readonly [x: string]: (IZtm | _ZTM) | undefined;
} | undefined>;
declare const generateRawSchema: <T extends ZodRawShape>({ ...props }: IGenerateSchema<T>) => _Schema<T>;

export { asyncLocalOptions, generateRawSchema, schema };
