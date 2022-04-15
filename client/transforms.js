// human made solution -> something we can send over to wasm
export const transformSolutionForWasm = (solution, numCols) =>
  new Int32Array(solution.map(({ row, col }) => row * numCols + col));

// make the wasm maze easier for humans to read :)
// [6, 8, 4, 4, 7, 8, 3, 13] -> [[6, 8, 4, 4], [7, 8, 3, 13]]
export const transformWasmMazeForHumans = (cells, numCols) =>
  cells.reduce((acc, walls, idx) => {
    const row = Math.floor(idx / numCols);
    if (!acc[row]) {
      acc[row] = [];
    }
    acc[row].push(walls);
    return acc;
  }, []);
