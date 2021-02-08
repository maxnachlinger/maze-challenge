import "./style.css";
import "./prism.css";
import "./prism";
import {
  drawRectsOnMazeCanvas,
  getMazeBaseDrawInstructions,
  getSolutionDrawInstructions,
  sizeMazeCanvas,
} from "./draw-maze";
import { testMaze, testMazeSolution } from "./test-maze";

const drawState = ({
  loading,
  ui: {
    downloadMazeLink,
    mazeDefinitionTextarea,
    mazeCanvas,
    solutionResultsDiv,
    solutionTextarea,
    testSolutionButton,
    generateMazeLink,
  },
  mazeBlockDimensions,
  mazeDefinition,
  solutionTestResult,
  solution,
}) => {
  if (animationHandle) {
    window.cancelAnimationFrame(animationHandle);
  }

  testSolutionButton.style.display = loading ? "hidden" : "";
  generateMazeLink.style.display = loading ? "hidden" : "";

  const mazeDefinitionString = JSON.stringify(mazeDefinition);

  downloadMazeLink.style.display = "inline";
  downloadMazeLink.setAttribute(
    "href",
    "data:application/json;charset=utf-8," +
      encodeURIComponent(mazeDefinitionString)
  );
  downloadMazeLink.setAttribute("download", "maze.json");

  mazeDefinitionTextarea.value = mazeDefinitionString;

  sizeMazeCanvas({ mazeCanvas, mazeBlockDimensions, mazeDefinition });

  const mazeBaseDrawInstructions = getMazeBaseDrawInstructions({
    mazeBlockDimensions,
    mazeDefinition,
  });

  const mazeCanvasContext = mazeCanvas.getContext("2d");
  mazeCanvasContext.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  drawRectsOnMazeCanvas({
    mazeCanvasContext,
    drawInstructions: mazeBaseDrawInstructions,
  });

  solutionTextarea.value = solution;

  if (!solutionTestResult) {
    solutionResultsDiv.setAttribute("class", "no-solution");
    return;
  }

  solutionResultsDiv.setAttribute(
    "class",
    solutionTestResult.valid ? "solution-valid" : "solution-invalid"
  );
  solutionResultsDiv.innerText = solutionTestResult.valid
    ? "Your solution works, well done!"
    : solutionTestResult.errorMessage;
};

// TODO - egad! get this global state out
let animationHandle;

const animateSolution = ({
  mazeBlockDimensions,
  ui: { mazeCanvas },
  solutionTestResult: { solution },
}) => {
  const drawInstructions = getSolutionDrawInstructions({
    mazeBlockDimensions,
    solution,
  });

  const mazeCanvasContext = mazeCanvas.getContext("2d");
  const drawStep = () => {
    const instruction = drawInstructions.shift();

    if (!instruction) {
      return;
    }

    drawRectsOnMazeCanvas({
      mazeCanvasContext,
      drawInstructions: [instruction],
    });

    animationHandle = window.requestAnimationFrame(drawStep);
  };

  drawStep();
};

const wasmLoaded = ({ ui, state }) => ({ generate_maze, check_solution }) => {
  state.loading = false;
  drawState(state);

  ui.updateMazeButton.addEventListener("click", () => {
    let parsedDefinition = null;
    try {
      parsedDefinition = JSON.parse(ui.mazeDefinitionTextarea.value);
    } catch (error) {
      state.solutionTestResult = {
        valid: false,
        errorMessage: `Invalid JSON submitted in maze definition, please check the format of your definition. ${error.message}`,
      };
      drawState(state);
      return;
    }

    state.mazeDefinition = parsedDefinition;
    drawState(state);
  });

  ui.testSolutionButton.addEventListener("click", () => {
    state.solution = ui.solutionTextarea.value;

    try {
      JSON.parse(state.solution);
    } catch (error) {
      state.solutionTestResult = {
        valid: false,
        errorMessage: `Invalid JSON submitted, please check the format of your solution. ${error.message}`,
      };
      drawState(state);
      return;
    }

    state.solutionTestResult = JSON.parse(
      check_solution(JSON.stringify(state.mazeDefinition), state.solution)
    );
    drawState(state);
    animateSolution(state);
  });

  ui.testMazeLink.addEventListener("click", () => {
    state.mazeDefinition = testMaze;
    state.solution = JSON.stringify(testMazeSolution);

    state.solutionTestResult = JSON.parse(
      check_solution(JSON.stringify(testMaze), state.solution)
    );

    drawState(state);
    animateSolution(state);
  });

  ui.generateMazeLink.addEventListener("click", () => {
    state.mazeDefinition = JSON.parse(generate_maze(100, 100));
    state.solution = null;
    state.solutionTestResult = null;
    drawState(state);
  });
};

const startUp = () => {
  const ui = [
    "downloadMazeLink",
    "mazeDefinitionTextarea",
    "updateMazeButton",
    "mazeCanvas",
    "solutionTextarea",
    "testSolutionButton",
    "solutionResultsDiv",
    "testMazeLink",
    "generateMazeLink",
  ].reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

  const state = {
    mazeDefinition: testMaze,
    solution: null,
    solutionTestResult: null,
    mazeBlockDimensions: { width: 6, height: 6 },
    ui,
    loading: true,
  };

  drawState(state);
  import("../pkg/index.js")
    .then(wasmLoaded({ ui, state }))
    .catch(console.error);
};

document.addEventListener("DOMContentLoaded", startUp);
