import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

// Proxy-based lazy initialization: PrismaClient is NOT created at import time.
// It is created only when the first database method is actually called at runtime.
// This prevents PrismaClientInitializationError during Next.js build-time module analysis.
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!globalThis.__prisma) {
      globalThis.__prisma = new PrismaClient();
    }
    const value = Reflect.get(globalThis.__prisma, prop, globalThis.__prisma);
    return typeof value === "function" ? value.bind(globalThis.__prisma) : value;
  },
});

export default prisma;
