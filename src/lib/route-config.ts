// Next.js route segment config constants.
//
// ⚠️  DO NOT re-export these into route.ts files.
//     Next.js uses static AST analysis to detect `dynamic` and `runtime` —
//     it cannot follow module re-exports.
//
// ✅  Copy the lines you need directly into each route file:
//       export const dynamic = "force-dynamic";
//       export const runtime = "nodejs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
