import { z } from "zod/v4";
import { generateRawSchema } from "../src/index";

const SUBDOCUMENT_SCHEMA = z.object({
  title: z.string().min(3).max(255),
  content: z.string().min(3).max(255),
  createdAt: z.date(),
});

const EXAMPLE_SCHEMA = z.object({
  name: z.string().min(3).max(255),
  age: z.number().min(18).max(100),
  active: z.boolean().default(false),
  access: z.enum(["admin", "user"]).default("user"),
  unique_num: z.number(),
  unique_sparse_num: z.number(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.enum(["CA", "NY", "TX"]),
  }),
  tags: z.string().min(3).max(255).array(),
  filters: z.array(z.string()).default(["default_filter"]),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  phone: z
    .string()
    .refine((v) => v.length === 10, "Must be a valid phone number"),
  email: z.string(),
  email_unique: z.string(),
  unique_date: z.date(),
  nullable_field: z.string().nullable(),
  hashes: z
    .string()
    .refine((val) => val.startsWith("oi"), { message: "Custom message" })
    .array(),

  posts: z.array(SUBDOCUMENT_SCHEMA),
  keys: z.map(z.string(), z.object({ value: z.number() })),
  number_map: z.map(z.number(), z.object({ value: z.number() })),
  access_map: z.map(z.enum(["admin", "user"]), z.object({ value: z.number() })),
  notes: z.any(),
});

test("schema is defined", () => {
  const schema = z.object({
    test: z.string(),
  });
  expect(generateRawSchema({ schema })).toBeDefined();
});

test("String type is defined", () => {
  console.log(generateRawSchema({ schema: EXAMPLE_SCHEMA }).name);
  expect(generateRawSchema({ schema: EXAMPLE_SCHEMA }).name).toBeDefined();
});
test("Number type is defined", () => {
  expect(
    generateRawSchema({ schema: EXAMPLE_SCHEMA }).unique_num
  ).toBeDefined();
});
