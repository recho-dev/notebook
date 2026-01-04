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
