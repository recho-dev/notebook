export class RuntimeError extends Error {
  constructor(
    message: string,
    public readonly input?: string,
  ) {
    super(message);
    this.name = "RuntimeError";
  }
}
