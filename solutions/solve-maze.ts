const up = 1;
const right = 2;
const down = 4;
const left = 8;

const colDirectionOffsets: Record<number, number> = {
  [left]: -1,
  [right]: 1,
  [up]: 0,
  [down]: 0,
};

const rowDirectionOffsets: Record<number, number> = {
  [left]: 0,
  [right]: 0,
  [up]: -1,
  [down]: 1,
};

const oppositeDirections: Record<number, number> = {
  [left]: right,
  [right]: left,
  [up]: down,
  [down]: up,
};

type RowsAndColumns = number[][];

type Position = {
  readonly row: number;
  readonly col: number;
};

type PrefectRectangularMazeNoLoops = {
  readonly rowsAndColumns: RowsAndColumns;
  readonly start: Position;
  readonly end: Position;
};

type PositionIsOnMazeInput = {
  readonly position: Position;
  readonly rowsAndColumns: RowsAndColumns;
};

const positionIsOnMaze = ({
  rowsAndColumns,
  position: { row, col },
}: PositionIsOnMazeInput): boolean =>
  row >= 0 &&
  row < rowsAndColumns.length &&
  col >= 0 &&
  col < rowsAndColumns[row].length;

type MoveInDirection = {
  readonly currentPosition: Position;
  readonly direction: number;
};

const moveInDirection = ({
  currentPosition: { row, col },
  direction,
}: MoveInDirection): Position => ({
  row: row + rowDirectionOffsets[direction],
  col: col + colDirectionOffsets[direction],
});

type PlacesExplored = number[][];

type MoveInDirectionIsValidInput = {
  readonly newPosition: Position;
  readonly direction: number;
  readonly rowsAndColumns: RowsAndColumns;
  readonly placesExplored: PlacesExplored;
};

const moveInDirectionIsValid = ({
  newPosition,
  direction,
  rowsAndColumns,
  placesExplored,
}: MoveInDirectionIsValidInput): boolean => {
  if (
    !positionIsOnMaze({
      rowsAndColumns,
      position: newPosition,
    })
  ) {
    return false;
  }

  if (
    placesExplored[newPosition.row] &&
    placesExplored[newPosition.row][newPosition.col]
  ) {
    return false;
  }

  // ouch!
  const youBumpedIntoAWall =
    (rowsAndColumns[newPosition.row][newPosition.col] &
      oppositeDirections[direction]) ===
    0;
  if (youBumpedIntoAWall) {
    return false;
  }

  return true;
};

type CurrentPath = Position[];

type TestMoveInDirectionInput = {
  readonly currentPath: CurrentPath;
  readonly currentPosition: Position;
  readonly direction: number;
  readonly rowsAndColumns: RowsAndColumns;
  readonly placesExplored: PlacesExplored;
};

type TestMoveInDirectionResult = {
  readonly currentPath: CurrentPath;
  readonly valid: boolean;
  readonly newPosition: Position;
};

const testMoveInDirection = ({
  currentPath,
  currentPosition,
  direction,
  rowsAndColumns,
  placesExplored,
}: TestMoveInDirectionInput): TestMoveInDirectionResult => {
  const newPosition = moveInDirection({
    direction,
    currentPosition,
  });

  const valid = moveInDirectionIsValid({
    direction,
    newPosition,
    rowsAndColumns,
    placesExplored,
  });

  return {
    currentPath: [...currentPath, newPosition],
    newPosition,
    valid,
  };
};

type TestMoveInAllDirectionsInput = {
  readonly currentPath: CurrentPath;
  readonly currentPosition: Position;
  readonly rowsAndColumns: RowsAndColumns;
  readonly mazeEnd: Position;
  readonly placesExplored: PlacesExplored;
};

type TestMoveInAllDirectionsOutput = {
  readonly successfulPath: TestMoveInDirectionResult[];
  readonly mazeCompletedResult: TestMoveInDirectionResult | null;
};

const testMoveInAllDirections = ({
  currentPath,
  currentPosition,
  rowsAndColumns,
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
        rowsAndColumns,
        placesExplored,
      });

      if (!result.valid) {
        return { mazeCompletedResult, successfulPath };
      }

      return {
        successfulPath: [...successfulPath, result],
        // test if we've completed the maze
        mazeCompletedResult:
          result.newPosition.row === mazeEnd.row &&
          result.newPosition.col === mazeEnd.col
            ? result
            : null,
      };
    },
    {
      mazeCompletedResult: null,
      successfulPath: [],
    } as TestMoveInAllDirectionsOutput
  );

const solveRectangularMaze = ({
  start,
  end,
  rowsAndColumns,
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
      rowsAndColumns,
      currentPosition,
      currentPath,
      placesExplored,
    });

    // we completed the maze, yay
    if (explorationResults.mazeCompletedResult) {
      return explorationResults.mazeCompletedResult.currentPath;
    }

    // add successful steps to the queue to try
    explorationResults.successfulPath.forEach(
      ({ currentPath, newPosition: { row, col } }) => {
        // mark step explored
        placesExplored[row] = placesExplored[row] || [];
        placesExplored[row][col] = 1;

        // add step to queue to try exploring from
        placesToExploreQueue.push({
          currentPosition: { row, col },
          currentPath,
        });
      }
    );
  }

  // no way out of the maze
  return [];
};
