export const up = 1;
export const right = 2;
export const down = 4;
export const left = 8;

export const colDirectionOffsets: Record<number, number> = {
  [left]: -1,
  [right]: 1,
  [up]: 0,
  [down]: 0,
};

export const rowDirectionOffsets: Record<number, number> = {
  [left]: 0,
  [right]: 0,
  [up]: -1,
  [down]: 1,
};

export const oppositeDirections: Record<number, number> = {
  [left]: right,
  [right]: left,
  [up]: down,
  [down]: up,
};

export type RectangularMazeDefinition = number[][];

export type Position = {
  readonly row: number;
  readonly col: number;
};

export type PrefectRectangularMazeNoLoops = {
  readonly mazeDefinition: RectangularMazeDefinition;
  readonly start: Position;
  readonly end: Position;
};
