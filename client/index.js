import { memory } from "maze-challenge/maze_challenge_bg";
import { PrefectRectangularMazeNoLoops } from "maze-challenge";
import { transformSolutionForWasm, transformWasmMazeForHumans } from './transforms';
import { testMaze, testMazeSolution } from './test-maze';
import { getSolutionDrawInstructions, mazeStyle, drawMaze, setupDrawing } from './draw-maze';

const numRows = 200;
const numCols = 200;

const generateNewMaze = () => {
  const maze = PrefectRectangularMazeNoLoops.new(numRows, numCols);
  return new Uint8Array(memory.buffer, maze.cells(), numRows * numCols);
};

// TODO - egad! get this global state out
let animationHandle;

const main = () => {
  const ui = [
    // "downloadMazeLink",
    // "mazeDefinitionTextarea",
    // "updateMazeButton",
    "mazeCanvas",
    // "solutionTextarea",
    // "testSolutionButton",
    // "solutionResultsDiv",
    // "testMazeLink",
    // "generateMazeLink",
    // "generateSmallMazeLink",
  ].reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

  const {drawMaze, sizeCanvas, drawMazeAndSolution} = setupDrawing(ui.mazeCanvas, numCols, numRows);

  sizeCanvas();

  const maze = PrefectRectangularMazeNoLoops.new(numRows, numCols, testMaze);
  const cells = new Int8Array(memory.buffer, maze.cells(), numRows * numCols);

  const state = {maze, cells};
  drawMaze(state.cells);

  addEventListener("click", () => {
    // if (animationHandle) {
    //   window.cancelAnimationFrame(animationHandle);
    //   animationHandle = undefined;
    //   return;
    // }
    //

    // new maze
    state.cells = generateNewMaze();
    drawMaze(state.cells);

    // test maze, test solution
    // const transformedMaze = transformWasmMazeForHumans(state.cells, numCols);
    //
    // const solutionForWasm = transformSolutionForWasm(testMazeSolution, numCols);
    // const result = state.maze.check_solution(solutionForWasm);
    //
    // if (!result) {
    //   drawMazeAndSolution(state.cells, testMazeSolution);
    // }

  });
};

main();
