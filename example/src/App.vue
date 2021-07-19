<template>
  <div id="app">
    scale: {{ scale.toFixed(2) }} <br />
    origin: ({{ originX.toFixed(2) }}, {{ originY.toFixed(2) }}) <br />
    translate: ({{ translateX.toFixed(2) }}, {{ translateY.toFixed(2) }}) <br />

    <PinchScrollZoom
      ref="zoomer"
      :width="300"
      :height="400"
      :scale.sync="scale"
      :translate-x.sync="translateX"
      :translate-y.sync="translateY"
      :origin-x.sync="originX"
      :origin-y.sync="originY"
      :within="within"
      :min-scale="minScale"
      :max-scale="maxScale"
      @scalling="(e) => onEvent('scalling', e)"
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
import Vue from "vue";
import PinchScrollZoom, { PinchScrollZoomEmitData } from "@coddicat/vue-pinch-scroll-zoom";

export default Vue.extend({
  components: {
    PinchScrollZoom,
  },
  data: () => ({
    within: false,
    minScale: 0.3,
    maxScale: 5,
    scale: 2,
    originX: 150,
    originY: 200,
    translateX: -100,
    translateY: -50,
    eventName: "N/A",
    eventData: {},
  }),
  methods: {
    onEvent(name: string, e: PinchScrollZoomEmitData ): void {
      this.eventName = name;
      this.eventData = e;
    },

    reset(): void {
      this.scale = 1;
      this.translateX = -100;
      this.translateY = -50;
      this.originX = 150;
      this.originY = 200;
    },
  },
});
</script>
