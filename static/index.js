const tryCatchAsync = async (promise) => {
  try {
    const result = await promise;
    return { result };
  } catch (error) {
    return { error };
  }
};

const getJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`(${response.status}) ${response.statusText} returned for: ${url}`);
  }

  const { result: json, error } = await tryCatchAsync(response.json());
  if (error) {
    error.message = `Could not parse returned JSON. ${error.message}`;
    throw error;
  }

  return json;
};

const createMazeCanvas = ({
  document,
  mazeBlockDimensions: { height, width },
  mazeDefinition: { rowsAndColumns },
}) => {
  const canvas = document.createElement('canvas');
  canvas.id = 'canvas';
  // assumes each row has the same number of columns
  canvas.width = rowsAndColumns[0].length * width;
  canvas.height = rowsAndColumns.length * height;
  return canvas;
};

const createDownloadLink = (document, mazeDefinition) => {
  const p = document.createElement('p');

  const link = document.createElement('a');
  link.setAttribute('id', 'download-a');
  link.setAttribute(
    'href',
    'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(mazeDefinition))
  );
  link.setAttribute('download', 'maze.json');
  link.innerText = 'Download Maze';
  p.appendChild(link);

  return p;
};

const createSolutionTextarea = (document) => {
  const div = document.createElement('div');
  div.setAttribute('id', 'solution-div');

  const textarea = document.createElement('textarea');
  textarea.setAttribute('id', 'solution-textarea');
  div.appendChild(textarea);

  return div;
};

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
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
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
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
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
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
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
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
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
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fillRect(x, y, width, height);
  };

  const endInstruction = (ctx) => {
    const x = end.col * width;
    const y = end.row * height;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.fillRect(x, y, width, height);
  };

  return [startInstruction, endInstruction, ...cellInstructions];
};

const getSolutionDrawInstructions = ({ mazeBlockDimensions: { height, width }, solution }) =>
  solution.map(({ row, col }, idx) => (ctx) => {
    // leave the start and end blocks
    if (idx === 0 || idx === solution.length - 1) {
      return;
    }
    const x = col * width;
    const y = row * height;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(x, y, width, height);
  });

const drawRectsOnCanvas2dContext = ({ canvas2dContext, drawInstructions }) =>
  drawInstructions.forEach((fn) => fn(canvas2dContext));

const startUp = async () => {
  const mazeBlockDimensions = { width: 10, height: 10 };

  const rootDiv = document.getElementById('root');

  const { result: mazeDefinition, error } = await tryCatchAsync(getJson('/maze'));
  if (error) {
    rootDiv.innerText = error;
    return;
  }

  const canvas = createMazeCanvas({
    document,
    mazeBlockDimensions,
    mazeDefinition,
  });

  rootDiv.prepend(canvas);
  rootDiv.appendChild(createDownloadLink(document, mazeDefinition));
  rootDiv.appendChild(createSolutionTextarea(document));

  const mazeBaseDrawInstructions = getMazeBaseDrawInstructions({
    mazeBlockDimensions,
    mazeDefinition,
  });

  const canvas2dContext = canvas.getContext('2d');

  drawRectsOnCanvas2dContext({
    canvas2dContext,
    drawInstructions: mazeBaseDrawInstructions,
  });

  // saving an image of the maze canvas for a quick re-render
  const mazeImage = new Image();
  mazeImage.src = canvas.toDataURL();

  const mazeState = {
    mazeImage,
    animationPlaying: false,
    intervalId: undefined,
    previouslyPlayed: false,
    solution: [],
  };

  const test = document.getElementById('test');

  // test.addEventListener('click', () => {
  //   mazeState.animationPlaying = true;
  //   test.disabled = mazeState.animationPlaying;
  //
  //   // restore maze image if we've previously played an animation
  //   if (mazeState.previouslyPlayed) {
  //     canvas2dContext.clearRect(0, 0, canvas.width, canvas.height);
  //     canvas2dContext.drawImage(mazeState.mazeImage, 0, 0);
  //   }
  //   mazeState.previouslyPlayed = true;
  //
  //   const drawInstructions = getSolutionDrawInstructions({ mazeBlockDimensions, solution });
  //
  //   const drawStep = () => {
  //     const instruction = drawInstructions.shift();
  //
  //     if (!instruction) {
  //       mazeState.animationPlaying = false;
  //       startButton.disabled = mazeState.animationPlaying;
  //       window.requestAnimationFrame(drawStep);
  //       return;
  //     }
  //
  //     drawRectsOnCanvas2dContext({
  //       canvas2dContext,
  //       drawInstructions: [instruction],
  //     });
  //
  //     window.requestAnimationFrame(drawStep);
  //   };
  //
  //   window.requestAnimationFrame(drawStep);
  // });
};

document.addEventListener('DOMContentLoaded', startUp);
