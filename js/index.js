// TODO - draw maze
// TODO - draw UI

const main = ({generate_maze, check_solution}) => {
  const testMaze = JSON.stringify(JSON.parse(generate_maze(4, 4)));

  const state = {
    testMaze,
    maze: JSON.parse(generate_maze(100, 100)),
  };

  const tmpMaze = JSON.stringify({
    start: {row: 0, col: 0},
    end: {row: 3, col: 3},
    rowsAndColumns: [
      [6, 8, 4, 4],
      [7, 8, 3, 13],
      [7, 8, 4, 5],
      [3, 10, 11, 9]
    ],
  });

  const tmpSolution = JSON.stringify([{"row":0,"col":0},{"row":1,"col":0},{"row":2,"col":0},{"row":3,"col":0},{"row":3,"col":1},{"row":3,"col":2},{"row":3,"col":3}]);

  console.log(check_solution(tmpMaze, tmpSolution));

  document.getElementById('testMazeText').innerText = testMaze;
};

import('../pkg/index.js').then(main).catch(console.error);
