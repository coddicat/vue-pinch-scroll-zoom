# vue-pinch-scroll-zoom
Vue component that provides content scrolling and zooming using mouse events or two fingers pinch on a mobile devices

#### example:
https://vue-pinch-scroll-zoom.coddicat.com/

<img src="https://github.com/coddicat/vue-pinch-scroll-zoom/blob/main/example/example.gif" width="250"/>

## Installation
```
npm i @coddicat/vue3-pinch-scroll-zoom
```

## Usage
template:
```html
<PinchScrollZoom
  ref="zoomer"
  :width="300"
  :height="400"
  :scale="scale"
  @scaling="scalingHandler"
  style="border: 1px solid black"
>
  <img src="https://picsum.photos/600/1000" width="300" height="400" />
</PinchScrollZoom>
```

type script:
```ts
import { Component, Vue } from "vue-property-decorator";
import PinchScrollZoom, { PinchScrollZoomEmitData, PinchScrollZoomRef } from "@coddicat/vue3-pinch-scroll-zoom";

@Component({
  name: "PinchScrollZoomExample",
  components: {
    PinchScrollZoom
  }
})
export default class PinchScrollZoomExample extends Vue {
  private scale = 2;
  public scalingHandler(e: PinchScrollZoomEmitData): void {
    console.log(e);
  },
  public reset() {
    (this.$refs.zoomer as PinchScrollZoomRef).setData({
      scale: 1,
      originX: 0,
      originY: 0,
      translateX: 0,
      translateY: 0        
    });
  }
}
```

## Props
the following properties don't support the ".async" modifier

|name|required|description|default|
|----|--------|-----------|-------|
|width|yes|visible area width||
|height|yes|visible area height||
|contentWidth|no|should be defined when content width larger than container width||
|contentHeight|no|should be defined when content height larger than container height||
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
|enableScaling|no| for enable listener scaling event| true
|enableStartDrag|no| for enable listener startDrag event| true
|enableStopDrag|no| for enable listener stopDrag event| true
|enableDragging|no| for enable listener dragging event| true

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

## Methods
```ts
.SetData(data: PinchScrollZoomSetData);

export interface PinchScrollZoomSetData {
    scale: number;
    originX: number;
    originY: number;
    translateX: number;
    translateY: number;
}

```