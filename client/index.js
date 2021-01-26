import "./style.css";
import "./prism.css";
import './prism';
import {drawRectsOnMazeCanvas, getMazeBaseDrawInstructions, getSolutionDrawInstructions, sizeMazeCanvas} from './draw-maze';

const drawState = ({
  ui: {
    downloadMazeLink,
    mazeDefinitionTextarea,
    mazeCanvas,
    solutionResultsDiv,
  },
  mazeBlockDimensions,
  mazeDefinition,
  solutionTestResult,
}) => {
  const mazeDefinitionString = JSON.stringify(mazeDefinition);

  downloadMazeLink.style.display = "inline";
  downloadMazeLink.setAttribute(
    "href",
    "data:application/json;charset=utf-8," +
      encodeURIComponent(mazeDefinitionString)
  );
  downloadMazeLink.setAttribute("download", "maze.json");

  mazeDefinitionTextarea.innerText = mazeDefinitionString;

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

  if (!solutionTestResult) {
    solutionResultsDiv.style.setProperty("display", "none");
    return;
  }

  solutionResultsDiv.style.setProperty("display", "block");
  solutionResultsDiv.innerText = solutionTestResult.valid
    ? "Your solution works, well done!"
    : "Your solution had some errors: " + solutionTestResult.errorMessage;
};

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

    window.requestAnimationFrame(drawStep);
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
  ].reduce((acc, id) => ({ ...acc, [id]: document.getElementById(id) }), {});

  const state = {
    mazeDefinition: JSON.parse(generate_maze(50, 50)),
    solution: null,
    mazeBlockDimensions: { width: 10, height: 10 },
    ui,
  };

  drawState(state);

  ui.updateMazeButton.addEventListener("click", () => {
    state.mazeDefinition = JSON.parse(ui.mazeDefinitionTextarea.value);
    drawState(state);
  });

  ui.testSolutionButton.addEventListener("click", () => {
    const solution = ui.solutionTextarea.value;
    state.solutionTestResult = JSON.parse(
      check_solution(JSON.stringify(state.mazeDefinition), solution)
    );

    drawState(state);
    animateSolution(state);
  });
};

import("../pkg/index.js").then(main).catch(console.error);
