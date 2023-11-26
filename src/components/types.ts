export interface PinchScrollZoomEmitData {
  x: number;
  y: number;
  scale: number;
  originX: number;
  originY: number;
  translateX: number;
  translateY: number;
}

export interface PinchScrollZoomSetData {
  scale?: number;
  originX?: number;
  originY?: number;
  translateX?: number;
  translateY?: number;
}

export interface PinchScrollZoomExposed {
  setData: (data: PinchScrollZoomSetData) => PinchScrollZoomEmitData;
  centralize: () => PinchScrollZoomEmitData;
  manualMove: (deltaX: number, delatY: number) => PinchScrollZoomEmitData;
  manualZoom: (factor: number) => PinchScrollZoomEmitData;
}

export enum PinchScrollZoomKeyAction {
  zoomIn,
  zoomOut,
  moveLeft,
  moveRight,
  moveUp,
  moveDown
}

export const PinchScrollZoomDefaultControls: Record<
  string,
  PinchScrollZoomKeyAction
> = {
  '+': PinchScrollZoomKeyAction.zoomIn,
  '-': PinchScrollZoomKeyAction.zoomOut,
  ArrowLeft: PinchScrollZoomKeyAction.moveLeft,
  ArrowRight: PinchScrollZoomKeyAction.moveRight,
  ArrowUp: PinchScrollZoomKeyAction.moveUp,
  ArrowDown: PinchScrollZoomKeyAction.moveDown
};
