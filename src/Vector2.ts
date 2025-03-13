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
    public constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    public add = (x: number, y: number) => {
        this.x += x;
        this.y += y;
        return this
    }

    public scale = (factor: Vector2 | number): Vector2 => {
        if (typeof factor === "number") {
            this.x *= factor
            this.y *= factor
            return this
        }

        this.x *= factor.x
        this.y *= factor.y
        return this
    }

    public snap = () => {
        this.x = Math.floor(this.x)
        this.y = Math.floor(this.y)
        return this
    }

    public length = () => {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    public normalize = () => {
        return this.scale(1 / this.length())
    }

    public round = () => {
        this.x = Math.round(this.x)
        this.y = Math.round(this.y)
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
        return this
    }

    public toString(): string {
        return `${this.x}, ${this.y}`
    }
}