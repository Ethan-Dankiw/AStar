import {Vector2} from "./Vector2";
import {randomGridPosition, randomNumber} from "./utils";
import {drawLine, drawRectangle} from "./Canvas";
import {AStar} from "./Path";

export const CANVAS = {
    WIDTH: 800,  // Width of the canvas in pixels
    HEIGHT: 800, // Height of the canvas in pixels
    DIMENSIONS: new Vector2(800, 800),
}

// Define properties of the GRID
export const GRID = {
    COLS: 20,
    ROWS: 20,
    DIMENSIONS: new Vector2(20, 20),
}

// Define properties of the GRID CELL
export const CELL = {
    WIDTH: CANVAS.WIDTH / GRID.COLS,
    HEIGHT: CANVAS.HEIGHT / GRID.ROWS,
    DIMENSIONS: new Vector2(CANVAS.WIDTH / GRID.COLS, CANVAS.HEIGHT / GRID.ROWS),
}

// Define global config values
export const CONFIG = {
    DRAW: {
        GRID: false,
        BACKGROUND: true,
        MAP: true,
        A_STAR: {
            START: true,
            END: true,
            EXPLORED_PATH: true,
            SHORTER_PATH: true,
            LONGER_PATH: true,
            COORDS: true,
        }
    },

    // DEBUG
    DEBUG: {
        STARTING_POSITION: true,
        ENDING_POSITION: true,
        WALL: {
            RANDOM: false,
            ZIG_ZAG: false,
            SEMI_BOX: true,
        }
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
export const MAP: number[][] = Array(GRID.COLS).fill(0).map(() => Array(GRID.ROWS).fill(0))

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
    if (CONFIG.DEBUG.STARTING_POSITION) START.update(0, 0)
    if (CONFIG.DEBUG.ENDING_POSITION) END.update(12, 8)

    if (CONFIG.DEBUG.WALL.SEMI_BOX) {
        for (let i = 2; i < GRID.ROWS / 2 + 5; i++) {
            MAP[3][i] = 1
        }
        for (let i = 4; i < GRID.ROWS / 2; i++) {
            MAP[i][14] = 1
        }
        for (let i = 2; i < GRID.ROWS / 2 + 5; i++) {
            MAP[10][i] = 1
        }
    }

    // DEBUG: MANUALLY PUT A LINE OF WALLS ON THE MAP
    if (CONFIG.DEBUG.WALL.ZIG_ZAG) {
        for (let i = 0; i < GRID.ROWS - 1; i++) {
            MAP[1][i] = 1
        }
        for (let i = 1; i < GRID.ROWS; i++) {
            MAP[3][i] = 1
        }
        for (let i = 0; i < GRID.ROWS - 1; i++) {
            MAP[5][i] = 1
        }
        for (let i = 1; i < GRID.ROWS; i++) {
            MAP[7][i] = 1
        }
        for (let i = 0; i < GRID.ROWS - 1; i++) {
            MAP[9][i] = 1
        }
        for (let i = 1; i < GRID.ROWS; i++) {
            MAP[11][i] = 1
        }
        for (let i = 0; i < GRID.ROWS - 1; i++) {
            MAP[13][i] = 1
        }
        for (let i = 1; i < GRID.ROWS; i++) {
            MAP[15][i] = 1
        }
        for (let i = 0; i < GRID.ROWS - 1; i++) {
            MAP[17][i] = 1
        }
        for (let i = 1; i < GRID.ROWS - 1; i++) {
            MAP[19][i] = 1
        }
    }

    // DEBUG: RANDOMLY PLACE WALLS ON MAP
    if (CONFIG.DEBUG.WALL.RANDOM) {
        for (let i = 0; i < GRID.COLS; i++) {
            for (let j = 0; j < GRID.ROWS; j++) {
                let num = randomNumber(0, 100)
                MAP[i][j] = (num > 60 ? 1 : 0)
            }
        }
    }

    // Prevent the MAP from placing a wall where the start and end are
    if (MAP[START.x][START.y] === 1) MAP[START.x][START.y] = 0
    if (MAP[END.x][END.y] === 1) MAP[END.x][END.y] = 0

    // Draw the BACKGROUND to the CANVAS
    if (CONFIG.DRAW.BACKGROUND) {
        ctx.save()
        ctx.fillStyle = '#404040'
        const top_left = new Vector2(0, 0)
        drawRectangle(ctx, top_left, CANVAS.DIMENSIONS)
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
                    drawRectangle(ctx, top_left, CELL.DIMENSIONS)
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
        drawRectangle(ctx, top_left, CELL.DIMENSIONS)
        ctx.restore()
    }

    // Draw the END Position to the CANVAS
    if (CONFIG.DRAW.A_STAR.END) {
        ctx.save()
        ctx.fillStyle = '#986666'
        const top_left = Vector2.from(END).scale(CELL.DIMENSIONS)
        drawRectangle(ctx, top_left, CELL.DIMENSIONS)
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
    ctx.save()
    ctx.font = `${1.5 * Math.floor(Math.sqrt(GRID.ROWS + GRID.COLS))}px Arial`

    // A* algorithm for pathfinding from start to finish
    const to_end = AStar(START.clone(), END.clone())
    const to_start = AStar(END.clone(), START.clone())

    const shorter_path = (to_end.length <= to_start.length ? to_end : to_start)
    const longer_path = (to_end.length <= to_start.length ? to_start : to_end)

    if (CONFIG.DRAW.A_STAR.SHORTER_PATH) {
        shorter_path.forEach(node => {
            if (CONFIG.DRAW.A_STAR.EXPLORED_PATH) {
                ctx.save()
                ctx.fillStyle = 'rgba(142,142,142,0.2)'
                drawRectangle(ctx, node.clone().scale(CELL.DIMENSIONS), CELL.DIMENSIONS)
                ctx.restore()
            }

            // DEBUG: Display the cell position and distance to end
            if (CONFIG.DRAW.A_STAR.COORDS) {
                ctx.save()
                ctx.font = `${1.7 * Math.floor(Math.sqrt(GRID.ROWS + GRID.COLS))}px Arial`
                ctx.fillStyle = '#bbbbbb'
                let x_pos = node.x * CELL.WIDTH + (CELL.WIDTH / 10)
                let y_pos = node.y * CELL.HEIGHT + (CELL.HEIGHT / 2)
                ctx.fillText(`(${node.x}, ${node.y})`, x_pos, y_pos, CELL.WIDTH);
                ctx.restore()
            }
        })
    }

    if (CONFIG.DRAW.A_STAR.LONGER_PATH) {
        longer_path.forEach(node => {
            if (CONFIG.DRAW.A_STAR.EXPLORED_PATH) {
                ctx.save()
                ctx.fillStyle = 'rgba(142,142,142,0.1)'
                drawRectangle(ctx, node.clone().scale(CELL.DIMENSIONS), CELL.DIMENSIONS)
                ctx.restore()
            }

            // DEBUG: Display the cell position and distance to end
            if (CONFIG.DRAW.A_STAR.COORDS) {
                ctx.save()
                ctx.font = `${1.7 * Math.floor(Math.sqrt(GRID.ROWS + GRID.COLS))}px Arial`
                ctx.fillStyle = '#bbbbbb'
                let x_pos = node.x * CELL.WIDTH + (CELL.WIDTH / 10)
                let y_pos = node.y * CELL.HEIGHT + (CELL.HEIGHT / 2)
                ctx.fillText(`(${node.x}, ${node.y})`, x_pos, y_pos, CELL.WIDTH);
                ctx.restore()
            }
        })
    }

    ctx.restore()
}

(() => {
    try {
        INIT()
    } catch (e) {
        console.error(e)
        if (e instanceof Error) {
            alert(`Unable to initialise game.\n\nCause:\n${e.message}`)
        } else {
            alert(`Unable to initialise game.`)
        }
    }
})()