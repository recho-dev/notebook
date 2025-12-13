import type {Transaction} from "@codemirror/state";

export type Range = {from: number; to: number};

export class BlockMetadata {
  public constructor(
    public readonly output: Range | null,
    public readonly source: Range,
    public attributes: Record<string, unknown> = {},
    public error: boolean = false,
  ) {}

  get from() {
    return this.output?.from ?? this.source.from;
  }

  get to() {
    return this.source.to;
  }

  public map(tr: Transaction): BlockMetadata {
    if (!tr.docChanged) return this;
    const output = this.output
      ? {
          from: tr.changes.mapPos(this.output.from, 1),
          to: tr.changes.mapPos(this.output.to, -1),
        }
      : null;
    const source = {
      from: tr.changes.mapPos(this.source.from, 1),
      to: tr.changes.mapPos(this.source.to, -1),
    };
    const attributes = this.attributes;
    const error = this.error;
    return new BlockMetadata(output, source, attributes, error);
  }
}
