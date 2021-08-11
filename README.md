# vue-pinch-scroll-zoom
Vue component that provides content scrolling and zooming using mouse events or two fingers pinch on a mobile devices

#### example:
https://vue-pinch-scroll-zoom.coddicat.com/

<img src="https://github.com/coddicat/vue-pinch-scroll-zoom/blob/main/example/example.gif" width="250"/>

## Installation
```
npm i @coddicat/vue-pinch-scroll-zoom
```

## Usage
template:
```
<PinchScrollZoom
  ref="zoomer"
  :width="300"
  :height="400"
  :scale="scale"
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
    },
    reset() {
      this.$refs.zoomer.setData({
        scale: 1,
        originX: 0,
        originY: 0,
        translateX: 0,
        translateY: 0        
      });
    }
  }
})
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
  translateX: number;
  translateY: number;  
}
```
- startDrag
- stopDrag
- dragging
- scalling

## Methods
```
.SetData(data: PinchScrollZoomSetData);

export interface PinchScrollZoomSetData {
    scale: number;
    originX: number;
    originY: number;
    translateX: number;
    translateY: number;
}

```
