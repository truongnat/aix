# React — version notes (concise)

| Topic | Typical version | Note |
|-------|-----------------|------|
| **React 18** | 18.x | Concurrent features; `createRoot`; Strict Mode dev double-invoke |
| **React 19** | 19+ | Check [react.dev](https://react.dev/) for Actions, `use` (when stable in your stack), and compiler-related guidance |
| **Next.js App Router** | 13.4+ stable | RSC default; `"use client"` boundaries — combine with **`nextjs-pro`** |
| **Legacy class lifecycle** | any | Prefer hooks in new code; class components still valid |

Confirm **`react` and `react-dom` versions** in `package.json`; framework (Next/Vite) may pin compatible ranges.
