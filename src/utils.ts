import {Vector2} from "./Vector2";

export const distance = (from: Vector2, to: Vector2): number => {
    // Suppose...
    // p1 = (x1, y1)
    // p2 = (x2, y2)
    // Then the distance from p1 to p2 is...
    // sqrt( (x2 - x1)^2 + (y2 - y1)^2 )
    let x_diff = to.x - from.x
    let y_diff = to.y - from.y
    return Math.sqrt( Math.pow(x_diff, 2) + Math.pow(y_diff, 2) )
}

export const inBounds = (num: number, min: number, max: number) => {
    return num >= min && num < max
}

export const randomNumber = (min: number, max: number) => {
    //                       Math.random()  =>  has bounds { 0 <= x <= 1}
    //                 Math.random() * max  =>  has bounds { 0 <= x <= max}
    //         (Math.random() * max) + min  =>  has bounds { min <= x <= max + min}
    // (Math.random() * (max - min)) + min  =>  has bounds { min <= x <= max}
    return Math.random() * (max - min) + min;
}