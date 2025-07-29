# zod-to-mongoose

**zod-to-mongoose** allows you to generate clean, type-safe Mongoose schemas from existing Zod schemas—without monkey-patching Zod or polluting your validation logic.

Inspired by libraries like `@zodyac/zod-mongoose` but without intrusive extensions.

---

## Why?

- **Keep Zod pure:** Use Zod exclusively for parsing and validation.
- **Declaratively map to Mongoose:** Generate Mongoose schemas without modifying your Zod types.
- **No monkey-patching:** Avoid altering Zod’s internals.
- **Optional overrides:** Provide Mongoose-specific field options externally via a simple API.

## TODO

- ObjectIds, UUIDs
- Pipe (zod)
- Other refinements??

---

## Features

- Full support for:
  - Nested objects
  - Arrays, Maps, Records
  - Optionals, Nullables
  - Defaults, Enums
- Supports:
  - `unique`, `index`, and other Mongoose options
- Mongoose schema types:
  - String, Number, BigInt, Date, Boolean
  - Mixed, Maps, Arrays
- TypeScript-first functional design
- Easily extensible architecture

---

## Example Usage

```typescript
import { z } from "zod";
import { generateRawSchema, ztm } from "zod-to-mongoose";

const userSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().min(18),
  isAdmin: z.boolean().optional(),
});

const userOptions = {
  username: ztm.unique().index(),
  email: ztm.unique(),
};

const mongooseSchemaDef = generateRawSchema({
  schema: userSchema.shape,
  options: userOptions,
});

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(mongooseSchemaDef);
const User = mongoose.model("User", UserSchema);
```

---

## Installation

```bash
npm install zod-to-mongoose
```

Peer dependencies:

- `mongoose` >= 8.x
- `zod` >= 4.x

---

## Lower-Level APIs

### `parseField`

```typescript
parseField({
  field: ZodType<T>,
  default?: any,
  required?: boolean,
  options?: _ZTM
}): mField
```

- Accepts a Zod type and returns a Mongoose-compatible field definition.
- Dispatches to appropriate handlers:
  - `parseObject`, `parseArray`, `parseString`, `parseNumber`, `parseDate`, `parseBoolean`, etc.
  - Falls back to `parseMixed` for unsupported/unknown types.

---

### Type Parsers

Each Zod type is handled by a specialized parser:

- **`parseObject`**: Handles nested Zod objects recursively.
- **`parseArray`**: Converts Zod arrays into Mongoose array definitions.
- **`parseMap`**: Converts ZodMap or ZodRecord into Mongoose Maps.
- **`parseString`**: Handles regex, min/max length, case, and enums.
- **`parseNumber` / `parseBigInt`**: Handles min/max checks.
- **`parseDate`**: Maps ZodDate constraints to Mongoose date options.
- **`parseBoolean`**: Handles booleans as expected.
- **`parseMixed`**: Fallback for undefined/null/unknown Zod types.

Each parser returns Mongoose-compatible field definitions (`mField` types) with optional `default`, `required`, and `validate`.

---

### Field Type Definitions (`mField` Types)

- **`mString`**: For ZodString / ZodEnum
- **`mNumber`** / **`mBigInt`**
- **`mBoolean`**
- **`mDate`**
- **`mArray`**
- **`mMap`**
- **`mMixed`**

Each type supports Mongoose’s specific options, e.g. `unique`, `min`, `max`, `regex`, etc.

---

### Optional Utilities

- **`mergeRegex`**: Merges multiple regex validators into one.
- **`getInnerType` / `getInnerElement`**: Unwraps ZodOptional, ZodNullable, and ZodDefault to find the base type.
- **`safeAccessProperty`**: Safely extracts deeply nested properties.

---

## Philosophy

- Use Zod exclusively for schema definition and validation.
- Avoid side-effects or intrusive extensions.
- Provide optional but explicit Mongoose field options via functional APIs.

---

## Status

🚧 Actively in development. Breaking changes may occur before 1.0.

---

## License

MIT
