## Maze Challenge

Given a maze defined as below, write code which returns the rows and cells visited to solve the maze.

### Maze definition format

```json
{
  "start": {"row": 0, "col": 0},
  "end": {"row": 3, "col": 3},
  "rowsAndColumns": [
    [6, 8, 4, 4],
    [7, 8, 3, 13],
    [7, 8, 4, 5],
    [3, 10, 11, 9]
  ]
}
```
- `start`: the starting row/cell position in the maze
- `end`: the end row/cell position in the maze
- `rowsAndColumns`: a two-dimensional array of rows and cells. The number in the cell are bits which tell you which 
  walls of that cell are open. Here are the bits for the walls:
  ```javascript
  const UP = 1;
  const RIGHT = 2;
  const DOWN = 4;
  const LEFT = 8;
  ```

Here's some example code testing a cell to see which exits are available:
```typescript
// directions used in the maze
const UP = 1;
const RIGHT = 2;
const DOWN = 4;
const LEFT = 8;

const testCell = 3;

// here's how you can check for walls/openings
console.log((testCell & UP) !== 0 ? 'you can go up' : 'wall above');
console.log((testCell & RIGHT) !== 0 ? 'you can go right' : 'wall to the right');
console.log((testCell & DOWN) !== 0 ? 'you can go down' : 'wall below');
console.log((testCell & LEFT) !== 0 ? 'you can go left' : 'wall to the left');
```

### Your solution

Your code should be able to solve any maze defined as per above. Please include the start and end positions in your 
solution as well.

The path though the maze provided by your code should be in the following JSON (whitespace doesn't matter):
```json
[
  {"row":0, "col":0},
  {"row":1, "col":0},
  {"row":2, "col":0},
  {"row":3, "col":0},
  {"row":3, "col":1},
  {"row":3, "col":2},
  {"row":3, "col":3}
]
```
This is the solution to the maze defined above by the way :)

### Hints and ideas

Aside from the cell values telling you the directions to try, you should also make sure you don't step off the maze :)
It will also help to keep track of cells you've already visited so you don't retry paths that didn't work out.

There are lots of maze solving algorithms out there, it's not a bad idea to have a look at a few of them.

### More notes

These mazes:
- have exactly 1 solution
- do not contain any loops
- contain cells with 4 possible walls, no diagonal moves are possible
