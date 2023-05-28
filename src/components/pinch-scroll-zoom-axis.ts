export default class PinchScrollZoomAxis {
  private _point = 0;
  private _start1 = 0;
  private _start2 = 0;
  private _origin: number;
  private _size: number;
  private _contentSize: number | undefined;

  constructor(props: {
    size: number;
    origin?: number;
    translate: number;
    contentSize?: number;
  }) {
    this._origin = props.origin ?? props.size / 2;
    this._size = props.size;
    this._point = props.translate;
    this._contentSize = props.contentSize;
  }

  public get point(): number {
    return this._point;
  }

  public get origin(): number {
    return this._origin;
  }

  public get start1(): number {
    return this._start1;
  }

  public get start2(): number {
    return this._start2;
  }

  public touch(point: number): void {
    this._start1 = point - this._point;
  }

  public pinch(point1: number, point2: number, scale: number): void {
    const prevOrigin = this._origin;
    const point = (point1 + point2) / 2;
    this._origin = prevOrigin + (point - prevOrigin - this._point) / scale;
    const delta = prevOrigin - this._origin;

    this._point += delta - delta * scale;
    this._start1 = point1 - this._point;
    this._start2 = point2 - this._point;
  }

  public dragPinch(point1: number, point2: number): void {
    const start = (this._start1 + this._start2) / 2;
    const point = (point1 + point2) / 2;
    this._point = point - start;
  }

  public dragTouch(point: number): void {
    this._point = point - this._start1;
  }

  public checkAndResetToWithin(scale: number): void {
    const contentSize = this._contentSize ?? this._size;
    if (contentSize * scale < this._size) {
      this._origin = this._size / 2;
      this._point = ((this._size - contentSize) * scale) / 2;
      return;
    }

    const overflow = (contentSize - this._size) * scale;
    const border = (this._size - this._size * scale) / 2;

    const originFactor =
      this._size / 2 - this._origin - (this._size / 2 - this._origin) * scale;
    if (this._point > originFactor - border) {
      this._point = originFactor - border;
    } else if (this._point < border + originFactor - overflow) {
      this._point = border + originFactor - overflow;
    }
  }

  public setPoint(point: number): void {
    this._point = point;
  }

  public setOrigin(origin: number): void {
    this._origin = origin;
  }
}
