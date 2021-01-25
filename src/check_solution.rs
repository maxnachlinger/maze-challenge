extern crate serde;
use crate::util::{Position, PrefectRectangularMazeNoLoops, DOWN, LEFT, RIGHT, UP};
use lazy_static::lazy_static;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CheckSolutionResult {
    #[serde(skip)]
    pub last_position: Option<Position>,
    pub error_message: Option<String>,
    pub solution: Vec<Position>,
    pub valid: bool,
}

pub struct DirectionAndName {
    pub name: String,
    pub value: i8,
}

lazy_static! {
    pub static ref DIRECTION_TO_NAME_MAP: HashMap<i8, String> = {
        [
            (LEFT, String::from("left")),
            (RIGHT, String::from("right")),
            (UP, String::from("up")),
            (DOWN, String::from("down")),
        ]
        .iter()
        .cloned()
        .collect()
    };
}

// assumes we've already guarded against diagonal and no-op moves
fn determine_move_direction(last_position: &Position, row: &i32, col: &i32) -> DirectionAndName {
    if &last_position.row != row {
        return if row < &last_position.row {
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

    if col < &last_position.col {
        return DirectionAndName {
            value: LEFT,
            name: DIRECTION_TO_NAME_MAP.get(&LEFT).unwrap().clone(),
        };
    }
    DirectionAndName {
        value: RIGHT,
        name: DIRECTION_TO_NAME_MAP.get(&RIGHT).unwrap().clone(),
    }
}

fn get_cell_wall_names(cell: &i8) -> String {
    vec![UP, RIGHT, DOWN, LEFT]
        .iter()
        .fold(vec![], |mut walls, direction| {
            if (cell & direction) != 0 {
                return walls;
            }
            walls.push(DIRECTION_TO_NAME_MAP.get(direction).unwrap().as_str());
            walls
        })
        .join(", ")
}

pub fn check_rectangular_maze_solution(
    maze: PrefectRectangularMazeNoLoops,
    solution: Vec<Position>,
) -> CheckSolutionResult {
    let mut check_solution_result = solution.iter().enumerate().fold(
        CheckSolutionResult {
            last_position: None,
            error_message: None,
            valid: true,
            solution: vec![],
        },
        |mut result, idx_position| {
            let (idx, position) = idx_position;

            // we've already found an error
            if !result.valid {
                return result;
            }

            let Position { row, col } = position;

            // no last position means we're starting, ensure we're starting at maze.start
            if result.last_position.is_none() {
                // is this position on the maze?
                if *row != maze.start.row || *col != maze.start.col {
                    result.error_message = Some(format!(
                        "Start your solution at the starting cell (row: {}, col: {}).",
                        &maze.start.row, &maze.start.col,
                    ));
                    result.valid = false;
                    return result;
                }

                result.solution.push(position.clone());
                result.last_position = Some(position.clone());
                return result;
            }

            // is this position on the maze?
            if row < &0
                || row > &((maze.rows_and_columns.len() as i32) - 1)
                || col < &0
                || col > &((maze.rows_and_columns[0].len() as i32) - 1)
            {
                result.error_message = Some(format!(
                    "The position at index ({}) (row: {}, col: {}) is not on the maze.",
                    &idx, &row, &col,
                ));
                result.valid = false;
                return result;
            }

            let last_position = result.last_position.unwrap();

            // check the change from the last position. Rules are:
            // 0. All moves must be 0 or 1 rows or columns away.
            // 1. Diagonal moves are not possible. So if row + col delta is > 1, error
            // 2. If both row and col deltas are 0, see if we're on the start or end position. If we
            //   are, ignore the move. If we are not, error with no-move.

            let position_delta = (last_position.row.abs() - row.abs()).abs()
                + (last_position.col.abs() - col.abs()).abs();

            // diagonal move
            if position_delta > 1 {
                result.error_message = Some(format!(
                    "The position at index ({}) moving from (row: {}, col: {}) to (row: {}, col: {}) was a diagonal move, which is not allowed.",
                    &idx, &last_position.row, &last_position.col, &row, &col,
                ));
                result.valid = false;
                return result;
            }

            // no-op
            if position_delta == 0 {
                result.error_message = Some(format!(
                    "No-move found at index ({}) from (row: {}, col: {}) to (row: {}, col: {}).",
                    &idx, &last_position.row, &last_position.col, &row, &col,
                ));
                result.valid = false;
                return result;
            }

            // determine direction of the move from last_position to position, see if the cell bits
            // in last_position allow an exit in that direction
            let position_direction = determine_move_direction(&last_position, &row, &col);
            let last_position_bits = maze.rows_and_columns[last_position.row as usize][last_position.col as usize];

            if (last_position_bits & position_direction.value) == 0 {
                let cell_walls = get_cell_wall_names(&last_position_bits);
                result.error_message = Some(format!(
                    "The position at index ({}) moving ({}) from (row: {}, col: {}) to (row: {}, col: {}) hit a wall. Cell at: (row: {}, col: {}) has walls: ({})",
                    &idx, position_direction.name, &last_position.row, &last_position.col, &row, &col, &last_position.row, &last_position.col, &cell_walls,
                ));
                result.valid = false;
                return result;
            }

            result.solution.push(position.clone());
            result.last_position = Some(position.clone());

            return result;
        },
    );

    if !check_solution_result.valid {
        return check_solution_result;
    }

    // check that the last cell of the solution is maze.end
    let Position { row, col } = solution[solution.len() - 1];
    if row != maze.end.row || col != maze.end.col {
        check_solution_result.error_message = Some(format!(
            "Complete your solution at the ending cell (row: {}, col: {}).",
            &maze.end.row, &maze.end.col,
        ));
        check_solution_result.valid = false;
    }

    check_solution_result
}
