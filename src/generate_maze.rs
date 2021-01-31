use crate::util::{
    shuffle_directions, Position, PrefectRectangularMazeNoLoops, COL_DIRECTION_OFFSETS,
    OPPOSITE_DIRECTIONS, ROW_DIRECTION_OFFSETS,
};

/*
Note: each column stores bits indicating open walls. So this would be true for
a cell A without a right wall: (A & RIGHT) != 0
The cell B to the right of A would also lack a left wall :) So (B & LEFT) != 0
|---|----
| A   B
|---|----
*/

// if you see this value in a cell, it's your first time there
const CELL_UNEXPLORED: i8 = 0;

pub fn generate_rectangular_maze(num_rows: i32, num_columns: i32) -> PrefectRectangularMazeNoLoops {
    let start = Position { row: 0, col: 0 };
    let end = Position {
        row: num_rows - 1,
        col: num_columns - 1,
    };

    let mut rows_and_columns: Vec<Vec<i8>> =
        vec![vec![CELL_UNEXPLORED; num_columns as usize]; num_rows as usize];

    let mut next_moves_stack: Vec<Position> = vec![start];

    while !next_moves_stack.is_empty() {
        let current_position = next_moves_stack
            .pop()
            .expect("next_moves_stack is not empty, but we could not pop an item off of it");

        // try to move in all directions, in random order
        shuffle_directions().iter().for_each(|direction| {
            // try to move in direction
            let row = current_position.row + ROW_DIRECTION_OFFSETS[direction];
            let col = current_position.col + COL_DIRECTION_OFFSETS[direction];

            // is new position on the maze?
            if row < 0 || row >= num_rows || col < 0 || col >= num_columns {
                return;
            }

            // have we visited this position? We don't want loops in the maze so return
            let new_cell = rows_and_columns
                .get(row as usize)
                .unwrap()
                .get(col as usize)
                .unwrap();

            if new_cell != &CELL_UNEXPLORED {
                return;
            }

            // explore the cell!

            // write the direction we exited from in to our old cell
            rows_and_columns[current_position.row as usize][current_position.col as usize] |=
                direction;

            // we entered the new cell from the opposite direction we left the old one.
            // write our entered direction top the new cell.
            rows_and_columns[row as usize][col as usize] |= OPPOSITE_DIRECTIONS[direction];

            // add this new location to the stack so we can come back and explore from
            // here
            next_moves_stack.push(Position { row, col });
        });
    }

    PrefectRectangularMazeNoLoops {
        start,
        rows_and_columns,
        end,
    }
}
