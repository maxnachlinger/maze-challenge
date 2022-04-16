import { memory } from "maze-challenge/maze_challenge_bg";
import { PrefectRectangularMazeNoLoops } from "maze-challenge";
import "./style.css";
import "./prism.css";
import "./prism";
import { testMaze, testMazeSolution } from "./test-maze";
import { setupDrawing } from "./draw-maze";

// human made solution -> something we can send over to wasm
const transformSolutionForWasm = (solution, numCols) =>
  new Int32Array(solution.map(({ x, y }) => y * numCols + x));

const arrayTo2d = (arr, perRow) =>
  arr.reduce((acc, walls, idx) => {
    const y = Math.floor(idx / perRow);
    if (!acc[y]) {
      acc[y] = [];
    }
    acc[y].push(walls);
    return acc;
  }, []);

const generateNewMaze = (numRows, numCols, cellsInput) => {
  const maze = PrefectRectangularMazeNoLoops.new(numRows, numCols, cellsInput);
  const cells = new Uint8Array(memory.buffer, maze.cells(), numRows * numCols);
  return { maze, cells };
};

const ensureNoAnimations = () => {
  if (!window.animationHandle) {
    return;
  }
  window.cancelAnimationFrame(animationHandle);
  window.animationHandle = undefined;
};

const drawState = ({
  mazeJSON,
  solutionJSON,
  solutionTestResult,
  drawInstructions,
  animateDrawInstructions,
  ui: { mazeDefinitionTextarea, solutionResultsDiv, solutionTextarea },
}) => {
  ensureNoAnimations();

  drawInstructions.forEach((fn) => fn());

  if (animateDrawInstructions) {
    animateDrawing(animateDrawInstructions);
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

const animateDrawing = ({ instructions, amtInstructionsPerTick = 1 }) => {
  ensureNoAnimations();

  const instructionsPerTick = arrayTo2d(instructions, amtInstructionsPerTick);

  const drawStep = () => {
    const toRun = instructionsPerTick.shift();
    if (!toRun) {
      ensureNoAnimations();
      return;
    }

    toRun.forEach((fx) => fx());
    window.animationHandle = window.requestAnimationFrame(drawStep);
  };
  drawStep();
};

export const startUp = () => {
  const ui = getUiElements();
  const drawing = setupDrawing(ui);

  const numRows = 100;
  const numCols = 100;

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
    drawInstructions: [
      drawing.getClearMazeInstruction(),
      ...drawing.getWallInstructions(numCols, cells),
    ],
    animateDrawInstructions: null,
  };

  drawState(state);

  ui.updateMazeButton.addEventListener("click", () => {
    state.drawInstructions = [];
    state.animateDrawInstructions = null;

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
    state.drawInstructions = [
      state.drawing.getClearMazeInstruction(),
      ...state.drawing.getWallInstructions(state.numCols, state.cells),
    ];

    drawState(state);
  });

  ui.testSolutionButton.addEventListener("click", () => {
    state.drawInstructions = [];
    state.animateDrawInstructions = null;

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

    state.drawInstructions = [
      state.drawing.getClearMazeInstruction(),
      ...state.drawing.getWallInstructions(state.numCols, state.cells),
    ];

    if (state.solutionTestResult === "ok") {
      state.animateDrawInstructions = {
        instructions: state.drawing.getSolutionInstructions(state.solution),
        amtInstructionsPerTick: 2,
      };
    }

    drawState(state);
    state.drawInstructions = [];
    state.animateDrawInstructions = null;
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
    state.solution = testMazeSolution;
    state.solutionJSON = JSON.stringify(testMazeSolution, null, 2);
    state.mazeJSON = null;
    state.animateDrawInstructions = null;

    state.solutionTestResult =
      state.maze.check_solution(
        transformSolutionForWasm(testMazeSolution, state.numCols)
      ) || "ok";

    state.drawInstructions = [
      state.drawing.getClearMazeInstruction(),
      ...state.drawing.getWallInstructions(state.numCols, state.cells),
    ];

    if (state.solutionTestResult === "ok") {
      state.animateDrawInstructions = {
        instructions: state.drawing.getSolutionInstructions(state.solution),
        amtInstructionsPerTick: 2,
      };
    }

    drawState(state);
    state.drawInstructions = [];
    state.animateDrawInstructions = null;
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
    state.drawInstructions = [
      state.drawing.getClearMazeInstruction(),
      ...state.drawing.getWallInstructions(state.numCols, state.cells),
    ];
    state.animateDrawInstructions = null;

    drawState(state);
    state.drawInstructions = [];
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
    state.drawInstructions = [
      state.drawing.getClearMazeInstruction(),
      ...state.drawing.getWallInstructions(state.numCols, state.cells),
    ];
    state.animateDrawInstructions = null;

    drawState(state);
    state.drawInstructions = [];
  });

  ui.downloadMazeLink.addEventListener("click", () => {
    const mazeJSON = JSON.stringify(
      // put the array of cells into a nicer 2d array format
      // [0,1,2,3] -> [[0,1],[2,3]]
      arrayTo2d(state.cells, state.numCols),
      null,
      2
    );
    ui.downloadMazeLink.setAttribute(
      "href",
      "data:application/json;charset=utf-8," + encodeURIComponent(mazeJSON)
    );
  });
};
