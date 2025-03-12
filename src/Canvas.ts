import {Vector2} from "./Vector2";


type Context = CanvasRenderingContext2D

export const drawReact = (ctx: Context, top_left: Vector2, dimensions: Vector2): void => {
    ctx.beginPath()
    ctx.rect(top_left.x, top_left.y, dimensions.x, dimensions.y)
    ctx.closePath()
    ctx.fill()
}

export const drawLine = (ctx: Context, start_pos: Vector2, end_pos: Vector2): void => {
    ctx.beginPath()
    ctx.moveTo(start_pos.x, start_pos.y)
    ctx.lineTo(end_pos.x, end_pos.y)
    ctx.closePath()
    ctx.stroke()
}