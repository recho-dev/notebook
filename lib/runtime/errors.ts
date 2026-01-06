// Originally developed by Observable, Inc.
// Adapted and modified by Recho from @observablehq/runtime v6.0.0
// Copyright 2018-2024 Observable, Inc.
// Copyright 2025-2026 Recho
// ISC License

export class RuntimeError extends Error {
  constructor(
    message: string,
    public readonly input?: string,
  ) {
    super(message);
    // Keep the property non-enumerable.
    Object.defineProperties(this, {
      name: {
        value: "RuntimeError",
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
  }
}
