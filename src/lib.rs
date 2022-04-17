use js_sys::Math::*;
use lazy_static::lazy_static;
use std::collections::HashMap;
use wasm_bindgen::prelude::wasm_bindgen;

// Using `wee_alloc` for smaller code size
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

pub const UP: i8 = 1;
pub const RIGHT: i8 = 2;
pub const DOWN: i8 = 4;
pub const LEFT: i8 = 8;

lazy_static! {
    pub static ref X_DIRECTION_OFFSETS: HashMap<i8, i32> =
        HashMap::from([(LEFT, -1), (RIGHT, 1), (UP, 0), (DOWN, 0)]);
    pub static ref Y_DIRECTION_OFFSETS: HashMap<i8, i32> =
        HashMap::from([(LEFT, 0), (RIGHT, 0), (UP, -1), (DOWN, 1)]);
    pub static ref OPPOSITE_DIRECTIONS: HashMap<i8, i8> =
        HashMap::from([(LEFT, RIGHT), (RIGHT, LEFT), (UP, DOWN), (DOWN, UP)]);
    pub static ref DIRECTION_TO_NAME_MAP: HashMap<i8, String> = HashMap::from([
        (LEFT, String::from("left")),
        (RIGHT, String::from("right")),
        (UP, String::from("up")),
        (DOWN, String::from("down")),
    ]);
}

fn shuffle_directions() -> Vec<i8> {
    let mut directions = vec![UP, RIGHT, DOWN, LEFT];
    let len = 4;

    for n in 0..len {
        let i = floor(random() * len as f64) as usize;
        directions.swap(i, len - n - 1);
    }

    directions
}

pub struct DirectionAndName {
    pub name: String,
    pub value: i8,
}

// assumes we've already guarded against diagonal and no-op moves
fn determine_move_direction(
    last_position: &Position,
    next_position: &Position,
) -> DirectionAndName {
    if &last_position.y != &next_position.y {
        return if &next_position.y < &last_position.y {
            DirectionAndName {
                value: UP,
                name: DIRECTION_TO_NAME_MAP.get(&UP).unwrap().clone(),
            }
        } else {
            DirectionAndName {
                value: DOWN,
                name: DIRECTION_TO_NAME_MAP.get(&DOWN).unwrap().clone(),
            }
        };
    }

    return if &next_position.x < &last_position.x {
        return DirectionAndName {
            value: LEFT,
            name: DIRECTION_TO_NAME_MAP.get(&LEFT).unwrap().clone(),
        };
    } else {
        DirectionAndName {
            value: RIGHT,
            name: DIRECTION_TO_NAME_MAP.get(&RIGHT).unwrap().clone(),
        }
    };
}

fn get_cell_wall_names(state: &i8) -> String {
    vec![UP, RIGHT, DOWN, LEFT]
        .iter()
        .fold(vec![], |mut walls, direction| {
            if (state & direction) != 0 {
                return walls;
            }
            walls.push(DIRECTION_TO_NAME_MAP.get(direction).unwrap().as_str());
            walls
        })
        .join(", ")
}

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

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Position {
    pub x: i32,
    pub y: i32,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct Cell {
    pub position: Position,
    pub state: i8,
}

#[wasm_bindgen]
pub struct PrefectRectangularMazeNoLoops {
    num_columns: i32,
    start: Position,
    end: Position,
    cells: Vec<i8>,
}

impl PrefectRectangularMazeNoLoops {
    fn cell_idx_to_position(&self, idx: &i32) -> Position {
        let y = if idx < &self.num_columns {
            0
        } else {
            (*idx as f32 / self.num_columns as f32).floor() as i32
        };
        let x = idx - (y * self.num_columns);
        Position { y, x }
    }
}

#[wasm_bindgen]
impl PrefectRectangularMazeNoLoops {
    pub fn cells(&self) -> *const i8 {
        self.cells.as_ptr()
    }

    pub fn new(
        num_rows: i32,
        num_columns: i32,
        cells: Option<Vec<i8>>,
    ) -> PrefectRectangularMazeNoLoops {
        let start = Position { x: 0, y: 0 };
        let end = Position {
            x: num_columns - 1,
            y: num_rows - 1,
        };

        if cells.is_some() {
            return PrefectRectangularMazeNoLoops {
                num_columns,
                start,
                cells: cells.unwrap(),
                end,
            };
        }

        let mut rows_columns_state: Vec<Vec<i8>> =
            vec![vec![CELL_UNEXPLORED; num_columns as usize]; num_rows as usize];

        let mut next_moves_stack: Vec<Position> = vec![start];

        while !next_moves_stack.is_empty() {
            let current_position = next_moves_stack
                .pop()
                .expect("next_moves_stack is not empty, but we could not pop an item off of it");

            // try to move in all directions, in random order
            shuffle_directions().iter().for_each(|direction| {
                // try to move in direction
                let x = current_position.x + X_DIRECTION_OFFSETS[direction];
                let y = current_position.y + Y_DIRECTION_OFFSETS[direction];

                // is new position on the maze?
                if y < 0 || y >= num_rows || x < 0 || x >= num_columns {
                    return;
                }

                // have we visited this position? We don't want loops in the maze so return
                let new_cell = rows_columns_state
                    .get(y as usize)
                    .unwrap()
                    .get(x as usize)
                    .unwrap();

                if new_cell != &CELL_UNEXPLORED {
                    return;
                }

                // explore the cell!

                // write the direction we exited from in to our old cell
                rows_columns_state[current_position.y as usize][current_position.x as usize] |=
                    direction;

                // we entered the new cell from the opposite direction we left the old one.
                // write our entered direction to the new cell.
                rows_columns_state[y as usize][x as usize] |= OPPOSITE_DIRECTIONS[direction];

                // add this new location to the stack so we can come back and explore from
                // here
                next_moves_stack.push(Position { x, y });
            });
        }

        let cells: Vec<i8> = rows_columns_state.into_iter().flatten().collect();

        PrefectRectangularMazeNoLoops {
            num_columns,
            start,
            cells,
            end,
        }
    }

    pub fn check_solution(&self, solution: Vec<i32>) -> Option<String> {
        let mut valid = true;
        let mut last_position: Option<Position> = None;
        let mut last_cell_idx: Option<i32> = None;

        let mut check_solution_result = solution.iter().fold(
            vec![],
            |mut result, idx| {
                // we've already found an error, exit early
                if !valid {
                    return result;
                }

                // if the cell wasn't found
                if self.cells.get(*idx as usize).is_none() {
                    result.push("A position was found that was not on the maze.".to_string());
                    valid = false;
                    return result;
                }

                let current_position = self.cell_idx_to_position(idx);

                // no last position means we're starting, ensure we're starting at maze.start
                if last_position.is_none() {
                    // is this position on the maze?
                    if current_position.x != self.start.x || current_position.y != self.start.y {
                        result.push(format!(
                            "Start your solution at the starting cell ({}, {}).",
                            &self.start.x, &self.start.y,
                        ));
                        valid = false;
                        return result;
                    }

                    last_cell_idx = Some(*idx);
                    last_position = Some(current_position);
                    return result;
                }

                // check the change from the last position. Rules are:
                // 0. All moves must be 0 or 1 rows or columns away.
                // 1. Diagonal moves are not possible. So if row + col delta is > 1, error
                // 2. If both row and col deltas are 0, see if we're on the start or end position. If we
                //   are, ignore the move. If we are not, error with no-move.

                let last_position_safe = last_position.unwrap();
                let position_delta = (last_position_safe.y.abs() - current_position.y.abs()).abs()
                    + (last_position_safe.x.abs() - current_position.x.abs()).abs();

                // diagonal move
                if position_delta > 1 {
                    result.push(format!(
                        "The move from ({}, {}) to ({}, {}) was a diagonal move, which is not allowed.",
                        &last_position_safe.x, &last_position_safe.y, &current_position.x, &current_position.y,
                    ));
                    valid = false;
                    return result;
                }

                // no-op
                if position_delta == 0 {
                    result.push(format!(
                        "No-move found from ({}, {}) to ({}, {}).",
                        &last_position_safe.x, &last_position_safe.y, &current_position.x, &current_position.y,
                    ));
                    valid = false;
                    return result;
                }

                // determine direction of the move from last_position to position, see if the cell bits
                // in last_position allow an exit in that direction
                let position_direction = determine_move_direction(&last_position_safe, &current_position);
                let last_cell = self.cells.get(last_cell_idx.unwrap() as usize).unwrap();

                if (last_cell & position_direction.value) == 0 {
                    let cell_walls = get_cell_wall_names(&last_cell);
                    result.push(format!(
                        "The move {} from ({}, {}) to ({}, {}) hit a wall. Cell at: ({}, {}) has walls: ({})",
                        position_direction.name, &last_position_safe.x, &last_position_safe.y, &current_position.x, &current_position.y, &last_position_safe.x, &last_position_safe.y, &cell_walls,
                    ));
                    valid = false;
                    return result;
                }

                last_cell_idx = Some(*idx);
                last_position = Some(current_position);
                result
            },
        );

        std::mem::forget(solution);

        if !valid {
            return Some(check_solution_result.join("\n"));
        }

        // check that the last cell of the solution is maze.end
        let Position { y, x } = last_position.unwrap();
        if y != self.end.y || x != self.end.x {
            check_solution_result.push(format!(
                "Complete your solution at the ending cell ({}, {}).",
                &self.end.x, &self.end.y,
            ));
            return Some(check_solution_result.join("\n"));
        }

        None
    }
}
