# vue-pinch-scroll-zoom
Vue component that provides content scrolling and zooming using mouse events or two fingers pinch on a mobile devices

## Important Note 
As of the current version, this component is compatible and fully tested with Vue "^3.2.47". 
Please ensure that you are using this version of Vue or later for optimal performance and compatibility. 
We will continue to maintain and update this component to support later versions of Vue as they become available.

#### example:
<img src="https://github.com/coddicat/vue-pinch-scroll-zoom/blob/main/example.gif" width="250"/>

## Installation
```
npm i @coddicat/vue-pinch-scroll-zoom
```

## Usage

main.ts:
```ts
import '@coddicat/vue-pinch-scroll-zoom/style.css';
```

```html
<PinchScrollZoom
  ref="zoomer"
  within
  centered
  key-actions
  :width="300"
  :height="400"
  :min-scale="0.3"
  :max-scale="6"
  @scaling="e => onEvent('scaling', e)"
  @startDrag="e => onEvent('startDrag', e)"
  @stopDrag="e => onEvent('stopDrag', e)"
  @dragging="e => onEvent('dragging', e)"
  style="border: 1px solid black"
  :content-width="500"
  :content-height="500"
>
  <img src="https://picsum.photos/500/500" width="500" height="500" />
</PinchScrollZoom>
```
```ts
<script setup lang="ts">
import { ref, reactive } from 'vue';
import PinchScrollZoom, {
  type PinchScrollZoomEmitData,
  type PinchScrollZoomExposed
} from '@coddicat/vue-pinch-scroll-zoom';

const zoomer = ref<PinchScrollZoomExposed>();

function onEvent(name: string, e: PinchScrollZoomEmitData): void {
  state.eventName = name;
  state.eventData = e;
  state.scale = e.scale;
  state.originX = e.originX;
  state.originY = e.originY;
  state.translateX = e.translateX;
  state.translateY = e.translateY;
}

function reset(): void {
  zoomer.value?.setData({
    scale: 1,
    originX: 150,
    originY: 200,
    translateX: -100,
    translateY: -50
  });
}

```

## Props
the following properties don't support the ".async" modifier

|name|required|description|default|
|----|--------|-----------|-------|
|width|yes|visible area width||
|height|yes|visible area height||
|content-width|no|should be defined when content width is different from container width||
|content-height|no|should be defined when content height is different from container height||
|minScale|no|minimum allowable scaling|0.3|
|maxScale|no|maximum allowable scaling|5|
|within|no|limit scrolling of content to its borders|true|
|wheelVelocity|no|zoom velocity when mouse wheel|0.001|
|scale|no|scale of the content|1|
|origin-x|no|transform-origin-x|width/2|
|origin-y|no|transform-origin-y|height/2|
|translate-x|no|transform: translateX|0|
|translate-y|no|transform: translateY|0|
|throttleDelay|no|rendering delay (milliseconds)|25|
|draggable|no|draggable of/off|true|
|centered|no|centralize content in visible area|false|
|key-actions|no|enable key press events(focused) for zooming and moving|false|
|tabindex|no|tabindex attribute for the visible area|0 if keyActions enabled, value is required for key events|
|key-zoom-velocity|no|zoom velocity when zooming by key events|0.2|
|key-move-velocity|no|move velocity when moving by key events|10|
|key-controls|no|Records of keyCode and actions|See PinchScrollZoomDefaultControls ('+', '-', arrows)|
|translate3d|no|Toggle between 'translate' and 'translate3d' transformation|true|

## Events
the following events are emitted with the argument:
```ts
export interface PinchScrollZoomEmitData {
  x: number;
  y: number;
  scale: number;
  originX: number;
  originY: number;
  translateX: number;
  translateY: number;  
}
```
- startDrag
- stopDrag
- dragging
- scaling

## Exposed Methods

### Update the data
```ts
.setData(data: PinchScrollZoomSetData);

export interface PinchScrollZoomSetData {
    scale: number;
    originX: number;
    originY: number;
    translateX: number;
    translateY: number;
}

```

### Centralize image content in the visible area
```ts
.centralize();
```

### Move image content in the visible area
```ts
.manualMove(deltaX: number, deltaY: number);
```

### Zoom image content in the visible area
```ts
.manualZoom(factor: number); //factor relative to the current value, so if current scale is 2 and execute .manualZoom(2) the new scale value will be 4
```