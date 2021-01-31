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
  ui: {
    downloadMazeLink,
    mazeDefinitionTextarea,
    mazeCanvas,
    solutionResultsDiv,
    solutionTextarea,
  },
  mazeBlockDimensions,
  mazeDefinition,
  solutionTestResult,
  solution,
}) => {
  if (animationHandle) {
    window.cancelAnimationFrame(animationHandle);
  }

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
    solutionResultsDiv.style.setProperty("display", "none");
    return;
  }

  solutionResultsDiv.style.setProperty("display", "block");
  solutionResultsDiv.innerText = solutionTestResult.valid
    ? "Your solution works, well done!"
    : "Your solution had some errors: " + solutionTestResult.errorMessage;
};

// TODO - get this global state out
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

const main = ({ generate_maze, check_solution }) => {
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
    mazeDefinition: JSON.parse(generate_maze(100, 100)),
    solution: null,
    solutionTestResult: null,
    mazeBlockDimensions: { width: 6, height: 6 },
    ui,
  };

  drawState(state);

  ui.updateMazeButton.addEventListener("click", () => {
    state.mazeDefinition = JSON.parse(ui.mazeDefinitionTextarea.value);
    drawState(state);
  });

  ui.testSolutionButton.addEventListener("click", () => {
    state.solution = ui.solutionTextarea.value;
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

import("../pkg/index.js").then(main).catch(console.error);
