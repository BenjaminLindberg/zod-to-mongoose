import { ZodRawShape } from "zod/v4";
import { SchemaOptions } from "../types";

type ZtmTransform = (v: any) => any;

// Recursive schema-aware options

export interface _ZTM {
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
export interface IZtm {
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

export interface ZtmObjectBuilder {}

export const isZtm = (obj: any): obj is IZtm => {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "_ztm" in obj &&
    typeof obj.unique === "function" &&
    typeof obj.sparse === "function" &&
    typeof obj.index === "function" &&
    typeof obj.immutable === "function" &&
    typeof obj.ref === "function" &&
    typeof obj.refPath === "function" &&
    typeof obj.get === "function" &&
    typeof obj.set === "function" &&
    typeof obj.uuid === "function" &&
    typeof obj.id === "function"
  );
};

// Pure factory for new, independent IZtm instances
export const createZtm = (state: IZtm["_ztm"] = {}): IZtm => {
  const next = (patch: Partial<IZtm["_ztm"]>) =>
    createZtm({ ...state, ...patch });

  return {
    _ztm: { ...state },

    unique: () => next({ unique: true }),
    sparse: () => next({ sparse: true }),
    index: () => next({ index: true }),
    immutable: () => next({ immutable: true }),
    ref: (ref) => next({ ref }),
    refPath: (refPath) => next({ refPath }),
    get: (get) => next({ get }),
    set: (set) => next({ set }),

    uuid: () => next({ type: "UUID" }),
    id: () => next({ type: "ObjectID" }),
  };
};

export const ztmObject = <T extends ZodRawShape>(
  values: SchemaOptions<T>
): SchemaOptions<T> => values;

export const ztm = createZtm();
