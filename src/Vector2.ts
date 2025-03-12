import {randomNumber} from "./utils";

export class Vector2 {
    public x: number
    public y: number

    static from(vec: Vector2) {
        return new Vector2(vec.x, vec.y)
    }

    // Random position
    static random(min: Vector2, max: Vector2): Vector2 {
        let x = randomNumber(min.x, max.x);
        let y = randomNumber(min.y, max.y);
        return new Vector2(x, y);
    }

    // Default to positioning off-screen
    constructor(x: number = -10, y: number = -10) {
        this.x = x
        this.y = y
    }

    public scale = (factor: Vector2): Vector2 => {
        this.x *= factor.x
        this.y *= factor.y
        return this
    }

    public snap = () => {
        this.x = Math.floor(this.x)
        this.y = Math.floor(this.y)
        return this
    }

    public equals = (pos: Vector2): boolean => {
        return pos.x === this.x && pos.y === this.y
    }

    public clone = (): Vector2 => {
        return new Vector2(this.x, this.y)
    }

    public update = (x: number, y: number) => {
        this.x = x
        this.y = y
    }

    public toString(): string {
        return `${this.x}, ${this.y}`
    }
}