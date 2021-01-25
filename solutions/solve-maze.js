"use strict";
const up = 1;
const right = 2;
const down = 4;
const left = 8;
const colDirectionOffsets = {
	[left]: -1,
	[right]: 1,
	[up]: 0,
	[down]: 0,
};
const rowDirectionOffsets = {
	[left]: 0,
	[right]: 0,
	[up]: -1,
	[down]: 1,
};
const oppositeDirections = {
	[left]: right,
	[right]: left,
	[up]: down,
	[down]: up,
};
const positionIsOnMaze = ({ rowsAndColumns, position: { row, col }, }) => row >= 0 && row < rowsAndColumns.length && col >= 0 && col < rowsAndColumns[row].length;
const moveInDirection = ({ currentPosition: { row, col }, direction, }) => ({
	row: row + rowDirectionOffsets[direction],
	col: col + colDirectionOffsets[direction],
});
const moveInDirectionIsValid = ({ newPosition, direction, rowsAndColumns, placesExplored, }) => {
	if (!positionIsOnMaze({
		rowsAndColumns,
		position: newPosition,
	})) {
		return false;
	}
	if (placesExplored[newPosition.row] && placesExplored[newPosition.row][newPosition.col]) {
		return false;
	}
	// ouch!
	const youBumpedIntoAWall = (rowsAndColumns[newPosition.row][newPosition.col] & oppositeDirections[direction]) === 0;
	if (youBumpedIntoAWall) {
		return false;
	}
	return true;
};
const testMoveInDirection = ({ currentPath, currentPosition, direction, rowsAndColumns, placesExplored, }) => {
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
const testMoveInAllDirections = ({ currentPath, currentPosition, rowsAndColumns, mazeEnd, placesExplored, }) => [up, right, down, left].reduce(({ mazeCompletedResult, successfulPath }, direction) => {
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
		mazeCompletedResult: result.newPosition.row === mazeEnd.row && result.newPosition.col === mazeEnd.col
			? result
			: null,
	};
}, { mazeCompletedResult: null, successfulPath: [] });

const solveRectangularMaze = ({ start, end, rowsAndColumns, }) => {
	const placesExplored = [];
	const placesToExploreQueue = [{ currentPosition: start, currentPath: [start] }];
	while (placesToExploreQueue.length > 0) {
		const placeToExplore = placesToExploreQueue.pop();
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
