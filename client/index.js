import { memory } from "maze-challenge/maze_challenge_bg";
import { PrefectRectangularMazeNoLoops } from "maze-challenge";
import "./style.css";
import "./prism.css";
import "./prism";
import {
  transformSolutionForWasm,
  transformWasmMazeForHumans,
} from "./transforms";
import { testMaze, testMazeSolution } from "./test-maze";
import { setupDrawing } from "./draw-maze";

const generateNewMaze = (numRows, numCols, cellsInput) => {
  const maze = PrefectRectangularMazeNoLoops.new(numRows, numCols, cellsInput);
  const cells = new Uint8Array(memory.buffer, maze.cells(), numRows * numCols);
  return { maze, cells };
};

// TODO - egad! get this global state out
let animationHandle;

const drawState = ({
  mazeJSON,
  solutionJSON,
  solutionTestResult,
  ui: { mazeDefinitionTextarea, solutionResultsDiv, solutionTextarea },
}) => {
  if (animationHandle) {
    window.cancelAnimationFrame(animationHandle);
    animationHandle = undefined;
  }

  mazeDefinitionTextarea.value = mazeJSON;

  solutionTextarea.value = solutionJSON || "";

  if (!solutionTestResult) {
    solutionResultsDiv.setAttribute("class", "no-solution");
    return;
  }

  solutionResultsDiv.setAttribute(
    "class",
    solutionTestResult === "ok" ? "solution-valid" : "solution-invalid"
  );
  solutionResultsDiv.innerText =
    solutionTestResult === "ok"
      ? "Your solution works, well done!"
      : solutionTestResult;
};

const getUiElements = () =>
  [
    "downloadMazeLink",
    "mazeDefinitionTextarea",
    "updateMazeButton",
    "mazeCanvas",
    "solutionTextarea",
    "testSolutionButton",
    "solutionResultsDiv",
    "testMazeLink",
    "generateMazeLink",
    "generateSmallMazeLink",
  ].reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

const animateSolution = ({ drawing, solution }) => {
  const drawInstructions = drawing.getSolutionDrawInstructions(solution);

  const drawStep = () => {
    const instruction = drawInstructions.shift();
    if (!instruction) {
      return;
    }

    drawing.executeDrawInstructions([instruction]);

    animationHandle = window.requestAnimationFrame(drawStep);
  };

  drawStep();
};

const startUp = () => {
  const ui = getUiElements();

  const numRows = 100;
  const numCols = 100;

  const drawing = setupDrawing(ui.mazeCanvas);

  drawing.sizeCanvas(numCols, numRows);

  const { maze, cells } = generateNewMaze(numRows, numCols, testMaze);

  const state = {
    maze,
    mazeJSON: null,
    cells,
    solution: null,
    solutionJSON: "",
    solutionTestResult: null,
    ui,
    drawing,
    numRows,
    numCols,
  };

  state.drawing.drawMaze(state.numCols, state.cells);

  ui.updateMazeButton.addEventListener("click", () => {
    let json = null;
    try {
      json = JSON.parse(ui.mazeDefinitionTextarea.value);
    } catch (error) {
      (state.solutionTestResult = `Invalid JSON submitted in maze definition, please check the format of your definition. ${error.message}`),
        drawState(state);
      return;
    }

    const numRows = json.length;
    const numCols = json[0].length;

    const { cells, maze } = generateNewMaze(
      numRows,
      numCols,
      new Int8Array(json.flat())
    );
    state.cells = cells;
    state.maze = maze;
    state.numRows = numRows;
    state.numCols = numCols;
    state.mazeJSON = JSON.stringify(json, null, 2);

    state.drawing.drawMaze(state.numCols, state.cells);
    drawState(state);
  });

  ui.testSolutionButton.addEventListener("click", () => {
    let json;
    try {
      json = JSON.parse(ui.solutionTextarea.value);
    } catch (error) {
      state.solutionTestResult = `Invalid JSON submitted, please check the format of your solution. ${error.message}`;
      drawState(state);
      return;
    }

    state.solution = json;
    state.solutionJSON = JSON.stringify(json, null, 2);
    const solutionForWasm = transformSolutionForWasm(json, state.numCols);

    state.solutionTestResult =
      state.maze.check_solution(solutionForWasm) || "ok";

    drawState(state);

    if (state.solutionTestResult === "ok") {
      animateSolution(state);
    }
  });

  ui.testMazeLink.addEventListener("click", () => {
    state.numRows = 100;
    state.numCols = 100;
    state.drawing.sizeCanvas(state.numCols, state.numRows);
    const { cells, maze } = generateNewMaze(
      state.numRows,
      state.numCols,
      testMaze
    );
    state.cells = cells;
    state.maze = maze;
    state.drawing.drawMaze(state.numCols, state.cells);
    state.solution = testMazeSolution;
    state.solutionJSON = JSON.stringify(testMazeSolution, null, 2);
    state.mazeJSON = null;

    state.solutionTestResult =
      state.maze.check_solution(
        transformSolutionForWasm(testMazeSolution, state.numCols)
      ) || "ok";

    drawState(state);

    if (state.solutionTestResult === "ok") {
      animateSolution(state);
    }
  });

  ui.generateMazeLink.addEventListener("click", () => {
    state.numRows = 100;
    state.numCols = 100;
    state.drawing.sizeCanvas(state.numCols, state.numRows);
    const { cells, maze } = generateNewMaze(state.numRows, state.numCols);
    state.cells = cells;
    state.maze = maze;
    state.solution = null;
    state.solutionJSON = null;
    state.solutionTestResult = null;
    state.mazeJSON = null;
    state.drawing.drawMaze(state.numCols, state.cells);
    drawState(state);
  });

  ui.generateSmallMazeLink.addEventListener("click", () => {
    state.numRows = 10;
    state.numCols = 10;
    state.drawing.sizeCanvas(state.numCols, state.numRows);
    const { cells, maze } = generateNewMaze(state.numRows, state.numCols);
    state.cells = cells;
    state.maze = maze;
    state.solution = null;
    state.solutionJSON = null;
    state.solutionTestResult = null;
    state.mazeJSON = null;
    state.drawing.drawMaze(state.numCols, state.cells);
    drawState(state);
  });

  ui.downloadMazeLink.addEventListener("click", () => {
    const mazeJSON = JSON.stringify(
      transformWasmMazeForHumans(state.cells, state.numCols),
      null,
      2
    );
    ui.downloadMazeLink.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(mazeJSON)
    );
  });
};

startUp();
