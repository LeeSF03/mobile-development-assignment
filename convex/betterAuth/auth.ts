import { GenericCtx } from "@convex-dev/better-auth";
import { createAuthOptions } from "./config";
import { DataModel } from "../_generated/dataModel";

export const options = createAuthOptions({} as GenericCtx<DataModel>);
