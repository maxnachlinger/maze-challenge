import { moveInDirection, positionIsOnMaze } from './util';
import {
  down,
  left,
  oppositeDirections,
  Position,
  PrefectRectangularMazeNoLoops,
  RectangularMazeDefinition,
  right,
  up,
} from './types';

export type PlacesExplored = number[][];

export type MoveInDirectionIsValidInput = {
  readonly newPosition: Position;
  readonly direction: number;
  readonly mazeDefinition: RectangularMazeDefinition;
  readonly placesExplored: PlacesExplored;
};

const moveInDirectionIsValid = ({
  newPosition,
  direction,
  mazeDefinition,
  placesExplored,
}: MoveInDirectionIsValidInput): boolean => {
  if (
    !positionIsOnMaze({
      mazeDefinition,
      position: newPosition,
    })
  ) {
    return false;
  }

  if (placesExplored[newPosition.row] && placesExplored[newPosition.row][newPosition.col]) {
    return false;
  }

  // ouch!
  const youBumpedIntoAWall =
    (mazeDefinition[newPosition.row][newPosition.col] & oppositeDirections[direction]) === 0;
  if (youBumpedIntoAWall) {
    return false;
  }

  return true;
};

export type CurrentPath = Position[];

export type TestMoveInDirectionInput = {
  readonly currentPath: CurrentPath;
  readonly currentPosition: Position;
  readonly direction: number;
  readonly mazeDefinition: RectangularMazeDefinition;
  readonly placesExplored: PlacesExplored;
};

export type TestMoveInDirectionResult = {
  readonly currentPath: CurrentPath;
  readonly valid: boolean;
  readonly newPosition: Position;
};

const testMoveInDirection = ({
  currentPath,
  currentPosition,
  direction,
  mazeDefinition,
  placesExplored,
}: TestMoveInDirectionInput): TestMoveInDirectionResult => {
  const newPosition = moveInDirection({
    direction,
    currentPosition,
  });

  const valid = moveInDirectionIsValid({
    direction,
    newPosition,
    mazeDefinition,
    placesExplored,
  });

  return {
    currentPath: [...currentPath, newPosition],
    newPosition,
    valid,
  };
};

export type TestMoveInAllDirectionsInput = {
  readonly currentPath: CurrentPath;
  readonly currentPosition: Position;
  readonly mazeDefinition: RectangularMazeDefinition;
  readonly mazeEnd: Position;
  readonly placesExplored: PlacesExplored;
};

export type TestMoveInAllDirectionsOutput = {
  readonly successfulPath: TestMoveInDirectionResult[];
  readonly mazeCompletedResult: TestMoveInDirectionResult | null;
};

const testMoveInAllDirections = ({
  currentPath,
  currentPosition,
  mazeDefinition,
  mazeEnd,
  placesExplored,
}: TestMoveInAllDirectionsInput): TestMoveInAllDirectionsOutput =>
  [up, right, down, left].reduce(
    ({ mazeCompletedResult, successfulPath }, direction) => {
      // maze was completed
      if (mazeCompletedResult) {
        return { mazeCompletedResult, successfulPath };
      }

      const result = testMoveInDirection({
        currentPath,
        currentPosition,
        direction,
        mazeDefinition,
        placesExplored,
      });

      if (!result.valid) {
        return { mazeCompletedResult, successfulPath };
      }

      return {
        successfulPath: [...successfulPath, result],
        // test if we've completed the maze
        mazeCompletedResult:
          result.newPosition.row === mazeEnd.row && result.newPosition.col === mazeEnd.col
            ? result
            : null,
      };
    },
    { mazeCompletedResult: null, successfulPath: [] } as TestMoveInAllDirectionsOutput
  );

export const solveRectangularMaze = ({
  start,
  end,
  mazeDefinition,
}: PrefectRectangularMazeNoLoops): Position[] => {
  const placesExplored: PlacesExplored = [];

  const placesToExploreQueue: {
    currentPosition: Position;
    currentPath: Position[];
  }[] = [{ currentPosition: start, currentPath: [start] }];

  while (placesToExploreQueue.length > 0) {
    const placeToExplore = placesToExploreQueue.pop();
    // makes TS happy, have a look below though - no way a falsy value could be
    // on the stack
    if (!placeToExplore) {
      continue;
    }

    const { currentPosition, currentPath } = placeToExplore;

    const explorationResults = testMoveInAllDirections({
      mazeEnd: end,
      mazeDefinition,
      currentPosition,
      currentPath,
      placesExplored,
    });

    // we completed the maze, yay
    if (explorationResults.mazeCompletedResult) {
      return explorationResults.mazeCompletedResult.currentPath;
    }

    // add successful steps to the queue to try
    explorationResults.successfulPath.forEach(({ currentPath, newPosition: { row, col } }) => {
      // mark step explored
      placesExplored[row] = placesExplored[row] || [];
      placesExplored[row][col] = 1;

      // add step to queue to try exploring from
      placesToExploreQueue.push({
        currentPosition: { row, col },
        currentPath,
      });
    });
  }

  // no way out of the maze
  return [];
};
