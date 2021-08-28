<template>
  <div id="app">
    scale: {{ scale.toFixed(2) }} <br />
    origin: ({{ originX.toFixed(2) }}, {{ originY.toFixed(2) }}) <br />
    translate: ({{ translateX.toFixed(2) }}, {{ translateY.toFixed(2) }}) <br />

    <PinchScrollZoom
      ref="zoomer"
      :width="300"
      :height="400"
      :scale="scale"
      :translate-x="translateX"
      :translate-y="translateY"
      :origin-x="originX"
      :origin-y="originY"
      :within="within"
      :min-scale="minScale"
      :max-scale="maxScale"
      @scaling="(e) => onEvent('scaling', e)"
      @startDrag="(e) => onEvent('startDrag', e)"
      @stopDrag="(e) => onEvent('stopDrag', e)"
      @dragging="(e) => onEvent('dragging', e)"
      style="border: 1px solid black"
      :content-width="500"
      :content-height="500"
    >
      <img src="https://picsum.photos/500/500" width="500" height="500" />
    </PinchScrollZoom>

    <button @click="reset">Reset</button>
    <label>
      <input type="checkbox" v-model="within" :value="true" />
      within
    </label>
    <br />
    <label>
      min scale:
      <input type="number" v-model.number="minScale" style="width: 40px" />
    </label>
    <label>
      max scale:
      <input type="number" v-model.number="maxScale" style="width: 40px" />
    </label>
    <p>
      {{ eventName }}:<br />
      {{ eventData }}
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PinchScrollZoom, { PinchScrollZoomEmitData } from "@coddicat/vue-pinch-scroll-zoom";

@Component({
  name: "PinchScrollZoomExample",
  components: {
    PinchScrollZoom
  }
})
export default class PinchScrollZoomExample extends Vue {
    private within = false;
    private minScale = 0.3;
    private maxScale = 5;
    private scale = 2;
    private originX = 150;
    private originY = 200;
    private translateX = -100;
    private translateY = -50;
    private eventName = "N/A";
    private eventData = {};

    public onEvent(name: string, e: PinchScrollZoomEmitData ): void {
      this.eventName = name;
      this.eventData = e;
      this.scale = e.scale;
      this.originX = e.originX;
      this.originY = e.originY;
      this.translateX = e.translateX;
      this.translateY = e.translateY;
    }

    public reset(): void {
      (this.$refs.zoomer as PinchScrollZoom).setData({
        scale: 1,
        originX: 150,
        originY: 200,
        translateX: -100,
        translateY: -50        
      });
    }
}
</script>
