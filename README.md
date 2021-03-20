# vue-pinch-scroll-zoom
Vue component that provides content scrolling and zooming using mouse events or two fingers pinch on a mobile devices

#### example:

## Installation
```
npm i @coddicat/vue-pinch-scroll-zoom
```

## Usage
template:
```
<PinchScrollZoom
  :width="300"
  :height="400"
  :scale.sync="scale"
  @scalling="scallingHandler"
  style="border: 1px solid black"
>
  <img src="https://picsum.photos/600/1000" width="300" height="400" />
</PinchScrollZoom>
```

script:
```
import PinchScrollZoom, { PinchScrollZoomEmitData } from "@coddicat/vue-pinch-scroll-zoom";

export default Vue.extend({
  data: () => ({
    scale: 2
  }),
  components: {
    PinchScrollZoom,
  },
  methods: {
    scallingHandler(e: PinchScrollZoomEmitData ): void {
      console.log(e);
    }
  }
})
```

## Props
the following properties can be used with the ".async" modifier

|name|required|description|default|
|----|--------|-----------|-------|
|width|yes|visible area width||
|height|yes|visible area height||
|minScale|no|minimum allowable scaling|0.3|
|maxScale|no|maximum allowable scaling|5|
|within|no|limit scrolling of content to its borders|true|
|wheelVelocity|no|zoom velocity when mouse wheel|0.001|
|scale|no|scale of the content|1|
|origin-x|no|transform-origin-x|width/2|
|origin-y|no|transform-origin-y|height/2|
|translate-x|no|transform: translateX|0|
|translate-y|no|transform: translateY|0|
|throttleDelay|no|rendering delay (milliseconds)|25

## Events
the following events are emitted with the argument:
```
export interface PinchScrollZoomEmitData {
  x: number;
  y: number;
  scale: number;
  originX: number;
  originY: number;
}
```
- startDrag
- stopDrag
- dragging
- scalling
