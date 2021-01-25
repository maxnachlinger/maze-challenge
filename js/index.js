const up = 1;
const right = 2;
const down = 4;
const left = 8;

const wallStrokeWidth = 1;

const getMazeBaseDrawInstructions = ({
  mazeBlockDimensions: { height, width },
  mazeDefinition: { rowsAndColumns, start, end },
}) => {
  const cellInstructions = rowsAndColumns.reduce(
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

  const startInstruction = (ctx) => {
    const x = start.col * width;
    const y = start.row * height;
    ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
    ctx.fillRect(x, y, width, height);
  };

  const endInstruction = (ctx) => {
    const x = end.col * width;
    const y = end.row * height;
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    ctx.fillRect(x, y, width, height);
  };

  return [startInstruction, endInstruction, ...cellInstructions];
};

const getSolutionDrawInstructions = ({
  mazeBlockDimensions: { height, width },
  solution,
}) =>
  solution.map(({ row, col }, idx) => (ctx) => {
    // leave the start and end blocks
    if (idx === 0 || idx === solution.length - 1) {
      return;
    }
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

const setupDownloadLink = ({ link, mazeDefinition }) => {
  link.setAttribute(
    "href",
    "data:application/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(mazeDefinition))
  );
  link.setAttribute("download", "maze.json");
};

const pastedMazeTextIsValid = (mazeDefinitionText) => {
  // TODO
  // mazeDefinitionText is required
  // should be valid JSON
  // should have start, end, and rowsAndColumns properties
  // start and end properties should be positions, with row and col numbers
  // rowsAndColumns 2d array should have length of 100
  // each row array in rowsAndColumns should have 100 items, all numbers
  // return an array of errors found
};

const drawMaze = ({
  mazeCanvas,
  mazeBlockDimensions,
  mazeDefinition,
  solution,
}) => {
  sizeMazeCanvas({ mazeCanvas, mazeBlockDimensions, mazeDefinition });

  const mazeBaseDrawInstructions = getMazeBaseDrawInstructions({
    mazeBlockDimensions,
    mazeDefinition,
  });

  const mazeCanvasContext = mazeCanvas.getContext("2d");

  drawRectsOnMazeCanvas({
    mazeCanvasContext,
    drawInstructions: mazeBaseDrawInstructions,
  });

  if (!solution) {
    return;
  }

  const solutionDrawInstructions = getSolutionDrawInstructions({
    mazeBlockDimensions,
    solution,
  });
  drawRectsOnMazeCanvas({ mazeCanvasContext, solutionDrawInstructions });
};

const drawState = (state) => {
  document.getElementById(
    "generateMaze"
  ).style.display = state.generateMazeEnabled ? "inline" : "none";

  const downloadMazeLink = document.getElementById("downloadMaze");

  if (!state.downloadMazeEnabled) {
    downloadMazeLink.style.display = "none";
    downloadMazeLink.setAttribute("href", "javascript: void(0)");
    downloadMazeLink.removeAttribute("download");
  }

  if (state.downloadMazeEnabled && state.mazeDefinition) {
    downloadMazeLink.style.display = "inline";
    downloadMazeLink.setAttribute(
      "href",
      "data:application/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(state.mazeDefinition))
    );
    downloadMazeLink.setAttribute("download", "maze.json");
  }

  const mazeCanvas = document.getElementById("mazeCanvas");
  const mazeCanvasContext = mazeCanvas.getContext("2d");

  if (!state.mazeDefinition) {
    mazeCanvasContext.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  } else {
    drawMaze({ mazeCanvas, ...state });
  }
};

const main = ({ generate_maze, check_solution }) => {
  const state = {
    mazeDefinition: null,
    solution: null,
    generateMazeEnabled: true,
    downloadMazeEnabled: false,
    mazeBlockDimensions: { width: 6, height: 6 },
  };

  drawState(state);

  const link = document.getElementById("generateMaze");
  link.addEventListener("click", (event) => {
    state.generateMazeEnabled = false;
    drawState(state);

    state.mazeDefinition = JSON.parse(generate_maze(100, 100));

    state.generateMazeEnabled = true;
    state.downloadMazeEnabled = true;
    drawState(state);
  });

  // TODO - handle validating solution and seeing if it is valid
};

import("../pkg/index.js").then(main).catch(console.error);
