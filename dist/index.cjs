"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  asyncLocalOptions: () => asyncLocalOptions,
  generateRawSchema: () => generateRawSchema,
  schema: () => schema
});
module.exports = __toCommonJS(index_exports);
var import_node_async_hooks = require("async_hooks");
var z = __toESM(require("zod/v4"));

// src/utils/ztm.ts
var isZtm = (obj) => {
  return obj !== null && typeof obj === "object" && "_ztm" in obj && typeof obj.unique === "function" && typeof obj.sparse === "function" && typeof obj.index === "function" && typeof obj.immutable === "function" && typeof obj.ref === "function" && typeof obj.refPath === "function" && typeof obj.get === "function" && typeof obj.set === "function" && typeof obj.uuid === "function" && typeof obj.id === "function";
};
var createZtm = (state = {}) => {
  const next = (patch) => createZtm(__spreadValues(__spreadValues({}, state), patch));
  return {
    _ztm: __spreadValues({}, state),
    unique: () => next({ unique: true }),
    sparse: () => next({ sparse: true }),
    index: () => next({ index: true }),
    immutable: () => next({ immutable: true }),
    ref: (ref) => next({ ref }),
    refPath: (refPath) => next({ refPath }),
    get: (get) => next({ get }),
    set: (set) => next({ set }),
    uuid: () => next({ type: "UUID" }),
    id: () => next({ type: "ObjectID" })
  };
};
var ztm = createZtm();

// src/utils/common.ts
var getInnerType = (field) => {
  return "innerType" in field.def && field.def.innerType;
};
var getInnerElement = (field) => {
  return "element" in field && field.element;
};
var isDefined = (value) => {
  return value !== void 0 && value !== null;
};
function safeAccessProperty(params) {
  const { object: object2, key } = params;
  if (typeof object2 !== "object" || object2 === null) return void 0;
  if (key in object2) {
    return object2[key];
  }
  return void 0;
}
var getFlattenedProperty = ({
  object: object2,
  key
}) => {
  if (!object2) return void 0;
  const keys = key;
  let item = object2;
  for (const k of keys) {
    if (item === null || item === void 0 || typeof item !== "object") {
      return void 0;
    }
    item = item[k];
  }
  return item;
};
var getFieldOptions = ({
  properties,
  parentStack,
  key
}) => {
  if (!properties) return {};
  const fullKey = parentStack.concat(key);
  return getFlattenedProperty({
    key: fullKey,
    object: properties
  }) || {};
};
var normalizeOptions = (options) => {
  let object2 = {};
  if (!options) return object2;
  Object.entries(options).forEach(([key, value]) => {
    if (isZtm(value)) {
      object2[key] = value._ztm;
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      object2[key] = normalizeOptions(value);
    } else {
      object2[key] = value;
    }
  });
  return object2;
};

// src/utils/mergeRegex.ts
var mergeRegex = (args, options = {}) => {
  const {
    preserveAnchors = true,
    mergeAnchors = false,
    deduplicate = true,
    wrapNonCapturingGroup = false
  } = options;
  if (!args.length) throw new Error("No regex expressions provided.");
  const flags = args[0].flags;
  const sources = [];
  let anchorStart = true;
  let anchorEnd = true;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof RegExp)) {
      throw new Error(`Argument ${i} is not a RegExp`);
    }
    let source = arg.source;
    if (!preserveAnchors) {
      const startsWithAnchor = source.startsWith("^");
      const endsWithAnchor = /[^\\]\$$/.test(source);
      if (startsWithAnchor) source = source.slice(1);
      if (endsWithAnchor) source = source.replace(/\$$/, "");
      if (!startsWithAnchor) anchorStart = false;
      if (!endsWithAnchor) anchorEnd = false;
    }
    sources.push(source);
  }
  const uniqueSources = deduplicate ? [...new Set(sources)] : sources;
  let pattern = uniqueSources.join("|");
  if (uniqueSources.length > 1 || wrapNonCapturingGroup) {
    pattern = `(?:${pattern})`;
  }
  if (mergeAnchors && !preserveAnchors) {
    pattern = (anchorStart ? "^" : "") + pattern + (anchorEnd ? "$" : "");
  }
  return new RegExp(pattern, flags);
};

// src/utils/parsers.ts
var import_v4 = require("zod/v4");
var import_mongoose = require("mongoose");
var parseField = (args) => {
  var _a;
  const { field } = args;
  if (field instanceof import_v4.ZodDefault) {
    return parseField(__spreadProps(__spreadValues({}, args), {
      // Get the actual getter function, and not just the return.
      default: "defaultValue" in field.def ? (_a = Object.getOwnPropertyDescriptor(field.def, "defaultValue")) == null ? void 0 : _a.get : void 0,
      field: getInnerType(field)
    }));
  } else if (field instanceof import_v4.ZodObject) {
    return parseObject(__spreadProps(__spreadValues({}, args), {
      schema: field
    }));
  } else if (field instanceof import_v4.ZodArray) {
    return parseArray(__spreadProps(__spreadValues({}, args), {
      field: getInnerElement(field)
    }));
  } else if (field instanceof import_v4.ZodNumber || field instanceof import_v4.ZodBigInt) {
    return parseNumber(__spreadProps(__spreadValues({}, args), {
      field
    }));
  } else if (field instanceof import_v4.ZodDate) {
    return parseDate(__spreadProps(__spreadValues({}, args), {
      field
    }));
  } else if (field instanceof import_v4.ZodString || field instanceof import_v4.ZodEnum) {
    return parseString(__spreadProps(__spreadValues({}, args), {
      field
    }));
  } else if (field instanceof import_v4.ZodBoolean) {
    return parseBoolean(__spreadProps(__spreadValues({}, args), {
      field
    }));
  } else if (field instanceof import_v4.ZodOptional) {
    return parseField(__spreadProps(__spreadValues({}, args), {
      field: getInnerType(field)
    }));
  } else if (field instanceof import_v4.ZodNullable) {
    return parseField(__spreadProps(__spreadValues({}, args), {
      field: getInnerType(field)
    }));
  } else if (field instanceof import_v4.ZodNull || field instanceof import_v4.ZodUndefined) {
    const type = field instanceof import_v4.ZodUndefined ? void 0 : null;
    return parseMixed(__spreadProps(__spreadValues({}, args), {
      field,
      validate: {
        validator: function(value) {
          return value === type;
        },
        message: `A${["undefined"].includes(String(type)) ? "n" : ""} ${String(
          type
        )} value is required for z.${String(type)}()`
      }
    }));
  } else if (field instanceof import_v4.ZodMap || field instanceof import_v4.ZodRecord) {
    return parseMap(__spreadProps(__spreadValues({}, args), {
      field: field.valueType
    }));
  } else {
    return parseMixed(__spreadProps(__spreadValues({}, args), {
      field
    }));
    throw new Error("Unsupported field type: " + field._zod.def.type);
  }
};
var parseMixed = (args) => {
  const { default: def, required = true, validate, options } = args;
  return __spreadProps(__spreadValues({}, options), {
    type: import_mongoose.Schema.Types.Mixed,
    default: def,
    required,
    validate
  });
};
var parseArray = (args) => {
  const { field: _field, options } = args;
  const field = parseField(__spreadProps(__spreadValues({}, args), {
    options
  }));
  if (!field) throw new Error("Unsupported array type");
  return __spreadProps(__spreadValues(__spreadValues(__spreadValues({}, options), args), field), {
    type: [field.type]
  });
};
var parseBoolean = (_a) => {
  var _b = _a, {
    default: def,
    options
  } = _b, args = __objRest(_b, [
    "default",
    "options"
  ]);
  return __spreadProps(__spreadValues(__spreadValues({}, args), options), {
    type: Boolean
  });
};
var parseMap = (_a) => {
  var _b = _a, {
    default: def,
    required = true,
    options
  } = _b, args = __objRest(_b, [
    "default",
    "required",
    "options"
  ]);
  const { field: _field } = args;
  const field = parseField(__spreadProps(__spreadValues({}, args), {
    options
  }));
  return __spreadProps(__spreadValues({}, options), {
    type: Map,
    of: field,
    default: def
  });
};
var parseDate = (_a) => {
  var _b = _a, {
    options,
    field
  } = _b, args = __objRest(_b, [
    "options",
    "field"
  ]);
  var _a2, _b2, _c, _d, _e, _f;
  const min = (_c = (_b2 = (_a2 = field.def.checks) == null ? void 0 : _a2.find(
    (c) => c._zod.def.check === "greater_than"
  )) == null ? void 0 : _b2._zod) == null ? void 0 : _c.def;
  const max = (_f = (_e = (_d = field.def.checks) == null ? void 0 : _d.find(
    (c) => c._zod.def.check === "less_than"
  )) == null ? void 0 : _e._zod) == null ? void 0 : _f.def;
  return __spreadProps(__spreadValues(__spreadValues({}, args), options), {
    type: Date,
    min: safeAccessProperty({
      object: min,
      key: "value"
    }),
    max: safeAccessProperty({
      object: max,
      key: "value"
    })
  });
};
var parseNumber = (_a) => {
  var _b = _a, {
    field,
    options
  } = _b, args = __objRest(_b, [
    "field",
    "options"
  ]);
  var _a2, _b2, _c, _d, _e, _f;
  const isNumber = field instanceof import_v4.ZodNumber;
  const min = (_c = (_b2 = (_a2 = field.def.checks) == null ? void 0 : _a2.find(
    (c) => c._zod.def.check === "greater_than"
  )) == null ? void 0 : _b2._zod) == null ? void 0 : _c.def;
  const max = (_f = (_e = (_d = field.def.checks) == null ? void 0 : _d.find(
    (c) => c._zod.def.check === "less_than"
  )) == null ? void 0 : _e._zod) == null ? void 0 : _f.def;
  return __spreadProps(__spreadValues(__spreadValues({}, options), args), {
    type: isNumber ? Number : BigInt,
    // Zod translates LTE to min value + 1, and GTE to value - 1
    min: safeAccessProperty({
      object: min,
      key: "value"
    }),
    max: safeAccessProperty({
      object: max,
      key: "value"
    })
  });
};
var parseString = (_a) => {
  var _b = _a, {
    field,
    required = true,
    options
  } = _b, args = __objRest(_b, [
    "field",
    "required",
    "options"
  ]);
  var _a2, _b2, _c, _d, _e;
  const regexArray = (_a2 = field.def.checks) == null ? void 0 : _a2.filter(
    (c) => c._zod.def.check === "string_format" && c._zod.def.format === "regex"
  ).map(
    (v) => {
      var _a3;
      return safeAccessProperty({
        object: (_a3 = v._zod) == null ? void 0 : _a3.def,
        key: "pattern"
      });
    }
  ).filter(isDefined);
  return __spreadProps(__spreadValues(__spreadValues({}, options), args), {
    type: String,
    enum: safeAccessProperty({
      object: field,
      key: "options"
    }),
    minLength: safeAccessProperty({
      object: (_b2 = field.def.checks) == null ? void 0 : _b2.find(
        (c) => c._zod.def.check === "min_length"
      ),
      key: "min"
    }),
    maxLength: safeAccessProperty({
      object: (_c = field.def.checks) == null ? void 0 : _c.find(
        (c) => c._zod.def.check === "max_length"
      ),
      key: "max"
    }),
    lowercase: Boolean(
      (_d = field.def.checks) == null ? void 0 : _d.find(
        (c) => c._zod.def.check === "string_format" && c._zod.def.format === "lowercase"
      )
    ),
    uppercase: Boolean(
      (_e = field.def.checks) == null ? void 0 : _e.find(
        (c) => c._zod.def.check === "string_format" && c._zod.def.format === "uppercase"
      )
    ),
    regex: regexArray && regexArray.length > 0 ? mergeRegex(regexArray) : void 0
  });
};
var parseObject = (_a) => {
  var args = __objRest(_a, []);
  const _a2 = args, { schema: obj, parentStack = [] } = _a2, options = __objRest(_a2, ["schema", "parentStack"]);
  const object2 = {};
  const globalOptions = asyncLocalOptions.getStore();
  for (const [key, field] of Object.entries(obj.def.shape)) {
    if (field.def.type === "object") {
      object2[key] = parseObject(__spreadValues({
        schema: field,
        parentStack: [...parentStack, key]
      }, options));
    } else {
      const f = parseField({
        field,
        options: getFieldOptions({
          properties: globalOptions,
          parentStack,
          key
        })
      });
      object2[key] = f;
    }
  }
  return object2;
};

// src/index.ts
var schema = z.object({
  test2: z.object({
    t: z.string().lowercase().default(() => crypto.randomUUID()),
    t2: z.string()
  }),
  k: z.null(),
  abc: z.record(
    z.string(),
    z.object({
      test: z.string()
    })
  ),
  tae: z.union([z.string(), z.number()]),
  d: z.date().min(Date.now()).max(Date.now() + 1),
  k3: z.number().min(132)
});
var asyncLocalOptions = new import_node_async_hooks.AsyncLocalStorage();
var generateRawSchema = (_a) => {
  var props = __objRest(_a, []);
  return asyncLocalOptions.run(normalizeOptions(props.options), () => {
    return parseObject(__spreadValues({}, props));
  });
};
console.log(
  generateRawSchema({
    schema,
    options: {
      tae: ztm.sparse().unique().get((v) => v).set((v) => v).ref("dwa"),
      test2: {
        t2: ztm.id(),
        t: { sparse: true }
      }
    }
  })
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  asyncLocalOptions,
  generateRawSchema,
  schema
});
//# sourceMappingURL=index.cjs.map