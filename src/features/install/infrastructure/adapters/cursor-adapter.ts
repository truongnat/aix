// Purpose: Cursor provider adapter
// Layer: infrastructure
// Depends on: runtime-adapter (transitional), domain/provider-adapter
//
// Cursor mapping — flesh out to read from ctx.core:
//   .cursor/rules/*.mdc     <- inherit core rules + generate per project

import { createRuntimeAdapter } from "./runtime-adapter";
import type { ProviderAdapter } from "../../domain/provider-adapter";

export const cursorAdapter: ProviderAdapter = createRuntimeAdapter("cursor");
