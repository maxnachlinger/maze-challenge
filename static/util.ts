import {
  colDirectionOffsets,
  Position,
  RectangularMazeDefinition,
  rowDirectionOffsets,
} from './types';

export type PositionIsOnMazeInput = {
  readonly position: Position;
  readonly mazeDefinition: RectangularMazeDefinition;
};

export const positionIsOnMaze = ({
  mazeDefinition,
  position: { row, col },
}: PositionIsOnMazeInput): boolean =>
  row >= 0 && row < mazeDefinition.length && col >= 0 && col < mazeDefinition[row].length;

export type MoveInDirection = {
  readonly currentPosition: Position;
  readonly direction: number;
};

export const moveInDirection = ({
  currentPosition: { row, col },
  direction,
}: MoveInDirection): Position => ({
  row: row + rowDirectionOffsets[direction],
  col: col + colDirectionOffsets[direction],
});
