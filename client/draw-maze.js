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

const getWallInstructions = (ctx) => (numCols, cells) => {
  const { width, height } = mazeStyle.blocks;
  const { lineWidth, strokeStyle } = mazeStyle.walls;
  const { up, right, down, left } = directionBits;

  return cells.reduce((instructions, cell, idx) => {
    const rowIdx = idx < numCols ? 0 : Math.floor(idx / numCols);
    const colIdx = idx - rowIdx * numCols;

    const x = colIdx * width;
    const y = rowIdx * height;

    // top wall
    if ((cell & up) === 0) {
      instructions.push(() => {
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
      instructions.push(() => {
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
      instructions.push(() => {
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
      instructions.push(() => {
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

const getClearMazeInstruction = (mazeCanvas, mazeCanvasContext) => () => () =>
  mazeCanvasContext.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

const getSolutionInstructions = (ctx) => (solution) =>
  solution.map(({ x, y }) => () => {
    ctx.fillStyle = mazeStyle.solution.fillStyle;
    ctx.fillRect(
      x * mazeStyle.blocks.width,
      y * mazeStyle.blocks.height,
      mazeStyle.blocks.width,
      mazeStyle.blocks.height
    );
  });

const sizeCanvas = (mazeCanvas) => (numCols, numRows) => {
  mazeCanvas.width = mazeStyle.blocks.width * numCols;
  mazeCanvas.height = mazeStyle.blocks.height * numRows;
};

export const setupDrawing = ({ mazeCanvas }) => {
  const mazeCanvasContext = mazeCanvas.getContext("2d", { alpha: false });
  return {
    sizeCanvas: sizeCanvas(mazeCanvas),
    getClearMazeInstruction: getClearMazeInstruction(
      mazeCanvas,
      mazeCanvasContext
    ),
    getWallInstructions: getWallInstructions(mazeCanvasContext),
    getSolutionInstructions: getSolutionInstructions(mazeCanvasContext),
  };
};
