<template>
  <div id="app">
    scale: {{ scale.toFixed(2) }} <br />
    origin: ({{ originX.toFixed(2) }}, {{ originY.toFixed(2) }}) <br />
    translate: ({{ translateX.toFixed(2) }}, {{ translateY.toFixed(2) }}) <br />

    <PinchScrollZoom
      ref="zoomer"
      v-bind="$attrs"
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
      :enableScaling="true"
      :enableStartDrag="true"
      :enableStopDrag="true"
      :enableDragging="true"
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
import { PinchScrollZoomEmitData, PinchScrollZoomRef } from "@/entry.esm";
import PinchScrollZoom from "@/pinch-scroll-zoom.vue";

import { defineComponent, ref } from "vue";

export default defineComponent({
   inheritAttrs: false,
  name: "PinchScrollZoomExample",
  components: {
    PinchScrollZoom,
  },
  setup() {
    const within = ref(false);
    const minScale = ref(0.3);
    const maxScale = ref(5);
    const scale = ref(2);
    const originX = ref(150);
    const originY = ref(200);
    const translateX = ref(-100);
    const translateY = ref(-50);
    const eventName = ref("N/A");
    const eventData = ref({});
    const zoomer = ref<PinchScrollZoomRef | null>(null);

    const onEvent = (name: string, e: PinchScrollZoomEmitData): void => {
      eventName.value = name;
      eventData.value = e;
      scale.value = e.scale;
      originX.value = e.originX;
      originY.value = e.originY;
      translateX.value = e.translateX;
      translateY.value = e.translateY;
    };

    const reset = (): void => {
      if (zoomer.value !== null) {
        (zoomer.value as PinchScrollZoomRef).setData({
          scale: 1,
          originX: 150,
          originY: 200,
          translateX: -100,
          translateY: -50,
        });
      }
    };

    return {
      within,
      minScale,
      maxScale,
      scale,
      originX,
      originY,
      translateX,
      translateY,
      eventName,
      eventData,
      zoomer,
      onEvent,
      reset,
    };
  },
});
</script>
