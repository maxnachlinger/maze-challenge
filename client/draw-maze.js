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
  },
};

export const directionBits = {
  up: 1,
  right: 2,
  down: 4,
  left: 8,
};

const drawWalls = (numCols, ctx, cells) => {
  const { width, height } = mazeStyle.blocks;
  const { lineWidth, strokeStyle } = mazeStyle.walls;
  const { up, right, down, left } = directionBits;

  return cells.forEach((cell, idx) => {
    const rowIdx = idx < numCols ? 0 : Math.floor(idx / numCols);
    const colIdx = idx - rowIdx * numCols;

    const x = colIdx * width;
    const y = rowIdx * height;

    // top wall
    if ((cell & up) === 0) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.stroke();
    }

    // right wall
    if ((cell & right) === 0) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.moveTo(x + width, y);
      ctx.lineTo(x + width, y + height);
      ctx.stroke();
    }

    // bottom wall
    if ((cell & down) === 0) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.stroke();
    }

    // left wall
    if ((cell & left) === 0) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeStyle;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + height);
      ctx.stroke();
    }
  });
};

const drawMaze = (mazeCanvas, mazeCanvasContext) => (numCols, cells) => {
  mazeCanvasContext.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);
  drawWalls(numCols, mazeCanvasContext, cells);
};

const getSolutionDrawInstructions = (ctx) => (solution) =>
  solution.map(({ row, col }) => () => {
    const x = col * mazeStyle.blocks.width;
    const y = row * mazeStyle.blocks.height;
    ctx.fillStyle = mazeStyle.solution.fillStyle;
    ctx.fillRect(x, y, mazeStyle.blocks.width, mazeStyle.blocks.height);
  });

const sizeCanvas = (mazeCanvas) => (numCols, numRows) => {
  mazeCanvas.width = mazeStyle.blocks.width * numCols;
  mazeCanvas.height = mazeStyle.blocks.height * numRows;
};

const executeDrawInstructions = (ctx) => (instructions) =>
  instructions.forEach((fn) => fn(ctx));

export const setupDrawing = (mazeCanvas) => {
  const mazeCanvasContext = mazeCanvas.getContext("2d");
  return {
    sizeCanvas: sizeCanvas(mazeCanvas),
    drawMaze: drawMaze(mazeCanvas, mazeCanvasContext),
    getSolutionDrawInstructions: getSolutionDrawInstructions(mazeCanvasContext),
    executeDrawInstructions: executeDrawInstructions(mazeCanvasContext),
  };
};
