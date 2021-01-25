const up = 1;
const right = 2;
const down = 4;
const left = 8;

const wallStrokeWidth = 1;

const getMazeBaseDrawInstructions = ({
  mazeBlockDimensions: { height, width },
  mazeDefinition: { rowsAndColumns, start, end },
}) =>
  rowsAndColumns.reduce(
    (instructions, row, rowIdx) =>
      row.reduce((cols, col, colIdx) => {
        const x = colIdx * width;
        const y = rowIdx * height;

        // top wall
        if ((col & up) === 0) {
          cols.push((ctx) => {
            ctx.lineWidth = wallStrokeWidth;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + width, y);
            ctx.stroke();
          });
        }

        // right wall
        if ((col & right) === 0) {
          cols.push((ctx) => {
            ctx.lineWidth = wallStrokeWidth;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.moveTo(x + width, y);
            ctx.lineTo(x + width, y + height);
            ctx.stroke();
          });
        }

        // bottom wall
        if ((col & down) === 0) {
          cols.push((ctx) => {
            ctx.lineWidth = wallStrokeWidth;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.moveTo(x, y + height);
            ctx.lineTo(x + width, y + height);
            ctx.stroke();
          });
        }

        // left wall
        if ((col & left) === 0) {
          cols.push((ctx) => {
            ctx.lineWidth = wallStrokeWidth;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + height);
            ctx.stroke();
          });
        }
        return cols;
      }, instructions),
    []
  );

const getSolutionDrawInstructions = ({
  mazeBlockDimensions: { height, width },
  solution,
}) =>
  solution.map(({ row, col }) => (ctx) => {
    const x = col * width;
    const y = row * height;
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(x, y, width, height);
  });

const drawRectsOnMazeCanvas = ({ mazeCanvasContext, drawInstructions }) =>
  drawInstructions.forEach((fn) => fn(mazeCanvasContext));

const sizeMazeCanvas = ({
  mazeCanvas,
  mazeBlockDimensions: { height, width },
  mazeDefinition: { rowsAndColumns },
}) => {
  // assumes each row has the same number of columns
  mazeCanvas.width = rowsAndColumns[0].length * width;
  mazeCanvas.height = rowsAndColumns.length * height;
};

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
    mazeDefinition: JSON.parse(generate_maze(100, 100)),
    solution: null,
    mazeBlockDimensions: { width: 6, height: 6 },
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
