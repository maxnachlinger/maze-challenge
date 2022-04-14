const mazeStyle = {
  walls: {
    lineWidth: 0.6,
    strokeStyle: "rgba(0, 0, 0, 0.5)",
  },
  blocks: {
    width: 6,
    height: 6,
  },
  solution: {
    fillStyle: "rgba(255, 0, 0, 0.5)",
  }
};

export const directionBits = {
  up: 1,
  right: 2,
  down: 4,
  left: 8,
};

const getMazeBaseDrawInstructions = (numCols, cells) => {
  const { width, height } = mazeStyle.blocks;
  const { lineWidth, strokeStyle } = mazeStyle.walls;
  const { up, right, down, left } = directionBits;

  return cells.reduce((instructions, cell, idx) => {
    const rowIdx = idx < numCols ? 0 : Math.floor(idx / numCols);
    const colIdx = idx - (rowIdx * numCols);

    const x = colIdx * width;
    const y = rowIdx * height;

    // top wall
    if ((cell & up) === 0) {
      instructions.push((ctx) => {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.stroke();
      });
    }

    // right wall
    if ((cell & right) === 0) {
      instructions.push((ctx) => {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
      });
    }

    // bottom wall
    if ((cell & down) === 0) {
      instructions.push((ctx) => {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
      });
    }

    // left wall
    if ((cell & left) === 0) {
      instructions.push((ctx) => {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + height);
        ctx.stroke();
      });
    }

    return instructions;
  }, []);
};

const drawMaze = (mazeCanvas, mazeCanvasContext, numCols) => (cells) => {
  mazeCanvasContext.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  getMazeBaseDrawInstructions(numCols, cells).forEach((fn) => fn(mazeCanvasContext));
};

const getSolutionDrawInstructions = (solution) => {
  const { width, height } = mazeStyle.blocks;
  const {fillStyle} = mazeStyle.solution;

  return solution.map(({row, col}) => (ctx) => {
    const x = col * width;
    const y = row * height;
    ctx.fillStyle = fillStyle;
    ctx.fillRect(x, y, width, height);
  });
};

const drawMazeAndSolution = (mazeCanvas, mazeCanvasContext, numCols) => (cells, solution) => {
  mazeCanvasContext.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  [
    ...getMazeBaseDrawInstructions(numCols, cells),
    ...getSolutionDrawInstructions(solution),
  ]
  .forEach((fn) => fn(mazeCanvasContext));
};

const sizeCanvas = (mazeCanvas, numCols, numRows) => () => {
  mazeCanvas.width = mazeStyle.blocks.width * numCols;
  mazeCanvas.height = mazeStyle.blocks.height * numRows;
};

export const setupDrawing = (mazeCanvas, numCols, numRows) => {
  const mazeCanvasContext = mazeCanvas.getContext("2d");
  return {
    sizeCanvas: sizeCanvas(mazeCanvas, numCols, numRows),
    drawMaze: drawMaze(mazeCanvas, mazeCanvasContext, numCols),
    drawMazeAndSolution: drawMazeAndSolution(mazeCanvas, mazeCanvasContext, numCols),
  }
};
