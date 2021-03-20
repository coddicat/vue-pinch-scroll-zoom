export default class PinchScrollZoomAxis {
    private _point;
    private _start1;
    private _start2;
    private _origin;
    private _size;
    constructor(size: number, origin: number | undefined, translate: number);
    get point(): number;
    get origin(): number;
    get start1(): number;
    get start2(): number;
    touch(point: number): void;
    pinch(point1: number, point2: number, scale: number): void;
    dragPinch(point1: number, point2: number): void;
    dragTouch(point: number): void;
    resetOrigin(): void;
    resetPoint(scale: number): void;
    setPoint(point: number): void;
    setOrigin(origin: number): void;
}
