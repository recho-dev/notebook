import type {Transaction} from "@codemirror/state";

export type Range = {from: number; to: number};

export class BlockMetadata {
  /**
   * Create a new `BlockMetadata` instance.
   * @param name a descriptive name of this block
   * @param output the range of the output region
   * @param source the range of the source region
   * @param attributes any user-customized attributes of this block
   * @param error whether this block has an error
   */
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly output: Range | null,
    public readonly source: Range,
    public attributes: Record<string, unknown> = {},
    public error: boolean = false,
  ) {}

  /**
   * Get the start position (inclusive) of this block.
   */
  get from() {
    return this.output?.from ?? this.source.from;
  }

  /**
   * Get the end position (exclusive) of this block.
   */
  get to() {
    return this.source.to;
  }

  public map(tr: Transaction): BlockMetadata {
    // If no changes were made to the document, return the current instance.
    if (!tr.docChanged) return this;

    // Otherwise, map the output and source ranges.
    const output = this.output
      ? {
          from: tr.changes.mapPos(this.output.from, -1),
          to: tr.changes.mapPos(this.output.to, 1),
        }
      : null;
    const source = {
      from: tr.changes.mapPos(this.source.from, 1),
      to: tr.changes.mapPos(this.source.to, 1),
    };
    return new BlockMetadata(this.id, this.name, output, source, this.attributes, this.error);
  }
}
