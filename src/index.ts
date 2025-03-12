
import {Vector2} from "./Vector2";
import {distance, inBounds} from "./utils";
import {drawLine, drawReact} from "./Canvas";

// Define properties of the HTML canvas
const CANVAS = {
    WIDTH: 800,  // Width of the canvas in pixels
    HEIGHT: 800, // Height of the canvas in pixels
    DIMENSIONS: new Vector2(),
}
CANVAS.DIMENSIONS.update(CANVAS.WIDTH, CANVAS.HEIGHT);

// Define properties of the GRID
const GRID = {
    COLS: 20,
    ROWS: 20,
    DIMENSIONS: new Vector2(),
}
GRID.DIMENSIONS.update(GRID.COLS, GRID.ROWS);

// Define properties of the GRID CELL
const CELL = {
    WIDTH: CANVAS.WIDTH / GRID.COLS,
    HEIGHT: CANVAS.HEIGHT / GRID.ROWS,
    DIMENSIONS: new Vector2(),
}
CELL.DIMENSIONS.update(CELL.WIDTH, CELL.HEIGHT);

// Define global config values
const CONFIG = {
    DRAW: {
        GRID: true,
        BACKGROUND: true,
        MAP: true,
        A_STAR: {
            START: true,
            END: true,
            PATH: true,
            COORDS: false,
        }
    },

    // DEBUG
    DEBUG: {
        STARTING_POSITION: false,
        ENDING_POSITION: false,
        MAP_WALL: false,
    },
}

// Create an Array of Arrays that represent the map
// e.g. a 4x4 GRID will have the below map
// [0,0,0,0]
// [0,0,0,0]
// [0,0,0,0]
// [0,0,0,0]

// EMPTY = 0
// WALL = 1
const MAP: number[][] = Array(GRID.COLS).fill(0).map(() => Array(GRID.ROWS).fill(0))

// Function that returns a random position on the grid
const randomGridPosition = (): Vector2 => {
    const min = new Vector2(0, 0)
    const max = new Vector2(GRID.COLS, GRID.ROWS)
    return Vector2.random(min, max).snap()
}

// Define the start and end position of the A* Algorithm
const START = randomGridPosition()
const END = randomGridPosition()

const INIT = () => {
    if (!GRID.ROWS || GRID.ROWS <= 0) throw new Error("Number of GRID ROWS must be a positive number greater than 0")
    if (!GRID.COLS || GRID.COLS <= 0) throw new Error("Number of GRID ROWS must be a positive number greater than 0")

    const canvas = document.getElementById('canvas') as HTMLCanvasElement | null
    if (!canvas) throw new Error('Canvas does not exist on the DOM')

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Provided context type does not exist')

    // Initialise the canvas dimensions
    ctx.canvas.width = CANVAS.WIDTH
    ctx.canvas.height = CANVAS.HEIGHT

    // DEBUG: MANUALLY SET START AND END POS
    if (CONFIG.DEBUG.STARTING_POSITION) START.update(1, 7)
    if (CONFIG.DEBUG.ENDING_POSITION) END.update(5, 7)

    // DEBUG: MANUALLY PUT A LINE OF WALLS ON THE MAP
    if (CONFIG.DEBUG.MAP_WALL) {
        for (let i = 0; i < 10; i++) {
            MAP[3][i + 5] = 1
        }
    }

    // Draw the BACKGROUND to the CANVAS
    if (CONFIG.DRAW.BACKGROUND) {
        ctx.save()
        ctx.fillStyle = '#404040'
        const top_left = new Vector2(0, 0)
        drawReact(ctx, top_left, CANVAS.DIMENSIONS)
        ctx.restore()
    }

    // Draw the MAP to the CANVAS
    if (CONFIG.DRAW.MAP) {
        ctx.save()
        ctx.fillStyle = '#303030'
        const top_left = new Vector2(0, 0)
        MAP.forEach((cols, col_idx) => {
            cols.forEach((cell, row_idx) => {
                if (cell !== 0) {
                    top_left.update(col_idx * CELL.WIDTH, row_idx * CELL.HEIGHT)
                    drawReact(ctx, top_left, CELL.DIMENSIONS)
                }
            })
        })
        ctx.restore()
    }

    // Draw the START Position to the CANVAS
    if (CONFIG.DRAW.A_STAR.START) {
        ctx.save()
        ctx.fillStyle = '#789866'
        const top_left = Vector2.from(START).scale(CELL.DIMENSIONS)
        drawReact(ctx, top_left, CELL.DIMENSIONS)
        ctx.restore()
    }

    // Draw the END Position to the CANVAS
    if (CONFIG.DRAW.A_STAR.START) {
        ctx.save()
        ctx.fillStyle = '#986666'
        const top_left = Vector2.from(END).scale(CELL.DIMENSIONS)
        drawReact(ctx, top_left, CELL.DIMENSIONS)
        ctx.restore()
    }

    // Draw the GRID lines to the CANVAS
    if (CONFIG.DRAW.GRID) {
        ctx.save()
        ctx.strokeStyle = '#505050'

        // Initialise start and end positions for the line
        const start = new Vector2(0, 0)
        const end = start.clone()

        // Draw horizontal grid lines
        for (let row = 0; row < GRID.ROWS; row++) {
            start.update(0, row * CELL.HEIGHT)
            end.update(CANVAS.WIDTH, row * CELL.HEIGHT)
            drawLine(ctx, start, end)
        }

        // Draw vertical grid lines
        for (let col = 0; col < GRID.COLS; col++) {
            start.update(col * CELL.WIDTH, 0)
            end.update(col * CELL.WIDTH, CANVAS.HEIGHT)
            drawLine(ctx, start, end)
        }
        ctx.restore()
    }

    //
    //
    // === A* Algorithm ==

    // Declare a pivot to check for each iteration of the A* Algorithm
    let pivot = START.clone()

    // Declare an array that stores the optimum path of the algorithm
    // TODO: Use Collection/Map for the paths
    const PATH: Vector2[] = []

    // Safe bounds to ensure no infinite loops occur
    let current_checks = 0;
    const MAX_CHECKS = GRID.COLS * GRID.ROWS

    ctx.save()
    ctx.font = `${1.5 * Math.floor(Math.sqrt(GRID.ROWS + GRID.COLS))}px Arial`

    // A* algorithm for pathfinding from start to finish
    while (current_checks < MAX_CHECKS) {
        // TODO: Use Priority Queue
        let min_dist = Infinity
        let possible_pivot: Vector2 | null = null

        // Check surrounding cells in a 3x3 grid around the pivot
        for (let col = pivot.x - 1; col <= pivot.x + 1; col++) {
            // If the column is out of bounds, skip the check
            if (!inBounds(col, 0, GRID.COLS)) continue

            for (let row = pivot.y - 1; row <= pivot.y + 1; row++) {
                // If the row is out of bounds, skip the check
                if (!inBounds(row, 0, GRID.ROWS)) continue

                // Skip cell if cell being checked is the pivot
                if (col === pivot.x && row === pivot.y) continue;

                // If the cell is a wall skip
                if (MAP[col][row] == 1) continue;

                // Get the distance from checked cell to the end
                let dist = distance(new Vector2(col, row), END)

                // If a smaller distance exists, that cell is closer to end
                if (dist < min_dist) {
                    min_dist = dist
                    possible_pivot = new Vector2(col, row)
                }
            }
        }

        // Increment the number of cells being checked
        current_checks++

        // If no pivot was found check again
        if (!possible_pivot) continue

        // If a pivot was found, but has reached the end of the algorithm break out of the loop
        if (possible_pivot.equals(END)) break

        // DEBUG: Display the cell position and distance to end
        if (CONFIG.DRAW.A_STAR.COORDS) {
            let x_pos = possible_pivot.x * CELL.WIDTH + (CELL.WIDTH / 6)
            let y_pos = possible_pivot.y * CELL.HEIGHT + (CELL.HEIGHT / 2)
            ctx.fillText(`(${possible_pivot.x}, ${possible_pivot.y})`, x_pos, y_pos, CELL.WIDTH);
        }

        // If a pivot was found
        pivot = possible_pivot
        PATH.push(pivot)

        if (CONFIG.DRAW.A_STAR.PATH) {
            ctx.save()
            ctx.fillStyle = '#555555'
            const top_left = Vector2.from(pivot).scale(CELL.DIMENSIONS)
            drawReact(ctx, top_left, CELL.DIMENSIONS)
            ctx.restore()
        }
    }
    ctx.restore()
}

(() => {
    try {
        INIT()
    } catch (e) {
        alert("Unable to initialise game.")
        console.error(e)
    }
})()