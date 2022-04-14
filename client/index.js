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
  ui: {
    downloadMazeLink,
    mazeDefinitionTextarea,
    solutionResultsDiv,
    solutionTextarea,
    testSolutionButton,
    generateMazeLink,
  },
}) => {
  if (animationHandle) {
    window.cancelAnimationFrame(animationHandle);
    animationHandle = undefined;
  }

  downloadMazeLink.style.display = "inline";
  downloadMazeLink.setAttribute(
    "href",
    "data:application/json;charset=utf-8," + encodeURIComponent(mazeJSON)
  );
  downloadMazeLink.setAttribute("download", "maze.json");

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

  const mazeJSON = JSON.stringify(
    transformWasmMazeForHumans(testMaze, numCols),
    null,
    2
  );

  const state = {
    maze,
    mazeJSON,
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
    let definitionJSON = null;
    try {
      definitionJSON = JSON.parse(ui.mazeDefinitionTextarea.value);
    } catch (error) {
      (state.solutionTestResult = `Invalid JSON submitted in maze definition, please check the format of your definition. ${error.message}`),
        drawState(state);
      return;
    }

    // TODO - calc numCols, numRows for state
    const { cells, maze } = generateNewMaze(
      100,
      100,
      new Int8Array(definitionJSON)
    );
    state.cells = cells;
    state.maze = maze;
    state.mazeJSON = JSON.stringify(definitionJSON, null, 2);

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
    const { cells, maze } = generateNewMaze(
      state.numRows,
      state.numCols,
      testMaze
    );
    state.cells = cells;
    state.maze = maze;
    state.solution = testMazeSolution;
    state.solutionJSON = JSON.stringify(testMazeSolution, null, 2);
    state.mazeJSON = JSON.stringify(
      transformWasmMazeForHumans(testMaze, state.numCols),
      null,
      2
    );

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

  // addEventListener("click", () => {
  //   // new maze
  //   let start = performance.now();
  //   state.cells = generateNewMaze();
  //   console.log("generateNewMaze()", performance.now() - start);
  //
  //   start = performance.now();
  //   drawMaze(state.cells);
  //   console.log("drawMaze()", performance.now() - start);
  // });
};

startUp();
