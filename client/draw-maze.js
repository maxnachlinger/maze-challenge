const up = 1;
const right = 2;
const down = 4;
const left = 8;

const wallStrokeWidth = 0.6;

export const getMazeBaseDrawInstructions = ({
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

export const getSolutionDrawInstructions = ({
  mazeBlockDimensions: { height, width },
  solution,
}) =>
  solution.map(({ row, col }) => (ctx) => {
    const x = col * width;
    const y = row * height;
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(x, y, width, height);
  });

export const drawRectsOnMazeCanvas = ({
  mazeCanvasContext,
  drawInstructions,
}) => drawInstructions.forEach((fn) => fn(mazeCanvasContext));

export const sizeMazeCanvas = ({
  mazeCanvas,
  mazeBlockDimensions: { height, width },
  mazeDefinition: { rowsAndColumns },
}) => {
  // assumes each row has the same number of columns
  mazeCanvas.width = rowsAndColumns[0].length * width;
  mazeCanvas.height = rowsAndColumns.length * height;
};
