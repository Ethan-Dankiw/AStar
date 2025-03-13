import {Vector2} from "./Vector2";
import {distance, inBounds} from "./utils";
import {GRID, MAP} from "./index";


export const AStar = (start: Vector2, end: Vector2) => {
    // Safe bounds to ensure no infinite loops occur
    let current_checks = 0;
    const MAX_CHECKS = GRID.COLS * GRID.ROWS

    let pivot = start.clone()

    // Key: Cell position on Map
    // Value: Distance from Node to End
    const explored_nodes = new Set<Vector2>()
    const path: Vector2[] = []

    const existingNode = (node: Vector2) => {
        let existing = false;
        Array.from(explored_nodes.keys()).forEach(explored => {
            if (explored.equals(node)) {
                existing = true
            }
        })
        return existing
    }

    // A* algorithm for pathfinding from start to finish
    while (current_checks < MAX_CHECKS) {
        console.log(`Iteration: ${current_checks}, current pivot (${pivot.toString()})`)

        // Variables to find minimum node
        let min_distance: number = Infinity
        let min_pivot: Vector2 | null = null

        // Check surrounding cells in a 3x3 grid around the pivot
        for (let col = pivot.x - 1; col <= pivot.x + 1; col++) {
            // If the column is out of bounds, skip the check
            if (!inBounds(col, 0, GRID.COLS)) continue

            for (let row = pivot.y - 1; row <= pivot.y + 1; row++) {
                // If the row is out of bounds, skip the check
                if (!inBounds(row, 0, GRID.ROWS)) continue

                // If the cell is a wall skip
                if (MAP[col][row] == 1) continue;

                // Store the current cell as a vector
                let cell = new Vector2(col, row)

                // Skip cell if the cell has already been checked
                if (existingNode(cell)) continue

                // Get the distance from checked cell to end goal
                const dist = distance(cell, end)

                // If there is node that is closer to the end
                if (dist <= min_distance) {
                    // Use it as a pivot
                    min_distance = dist
                    min_pivot = cell
                }

                // Record that the node has been explored
                explored_nodes.add(cell)
            }
        }

        current_checks++

        // If a node was not found to be closer to the end, skip
        if (!min_pivot) continue

        // If a pivot was found, but that pivot is the end goal.
        // Stop the algorithm
        if (min_pivot.equals(end)) break

        pivot = min_pivot

        // Store the node as part of the path
        path.push(pivot)
    }

    return path
}