// human made solution -> something we can send over to wasm
export const transformSolutionForWasm = (solution, numCols) => new Int32Array(solution.map(({row, col}) => (row * numCols) + col));

// make the wasm maze easier for humans to read :)
export const transformWasmMazeForHumans = (cells, numCols) => cells.reduce((acc, walls, idx) => {
  const row = idx < numCols ? 0 : Math.floor(idx / numCols);
  const col = idx - (row * numCols);
  acc[idx] = {row, col, walls};
  return acc;
}, []);
