<script setup lang="ts">
import { ref, reactive } from 'vue';
import PinchScrollZoom from './components/pinch-scroll-zoom.vue';
import {
  PinchScrollZoomEmitData,
  PinchScrollZoomExposed
} from './components/types';
const zoomer = ref<PinchScrollZoomExposed>();

const within = ref(false);
const minScale = ref(0.3);
const maxScale = ref(5);

const state = reactive<{
  scale?: number;
  originX?: number;
  originY?: number;
  translateX?: number;
  translateY?: number;
  eventName?: string;
  eventData?: PinchScrollZoomEmitData;
}>({});

function onEvent(name: string, e: PinchScrollZoomEmitData): void {
  state.eventName = name;
  state.eventData = e;
  mapStateProps(e);
}

function mapStateProps(zommData: PinchScrollZoomEmitData) {
  state.scale = zommData.scale;
  state.originX = zommData.originX;
  state.originY = zommData.originY;
  state.translateX = zommData.translateX;
  state.translateY = zommData.translateY;
}

function reset(): void {
  if (!zoomer.value) {
    throw new Error("PinchScrollZoom wasn't added");
  }
  zoomer.value.centralize();
  const newState = zoomer.value.setData({
    scale: 1
  });
  mapStateProps(newState);
}
</script>

<template>
  <div style="text-align: left">
    scale: {{ state.scale?.toFixed(2) }} <br />
    origin: ({{ state.originX?.toFixed(2) }}, {{ state.originY?.toFixed(2) }})
    <br />
    translate: ({{ state.translateX?.toFixed(2) }},
    {{ state.translateY?.toFixed(2) }}) <br />
    <PinchScrollZoom
      ref="zoomer"
      centered
      key-actions
      :width="300"
      :height="400"
      :within="within"
      :min-scale="minScale"
      :max-scale="maxScale"
      @scaling="e => onEvent('scaling', e)"
      @startDrag="e => onEvent('startDrag', e)"
      @stopDrag="e => onEvent('stopDrag', e)"
      @dragging="e => onEvent('dragging', e)"
      style="border: 1px solid black"
      :content-width="500"
      :content-height="500"
      translate3d
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
    <p style="width: 500px">
      {{ state.eventName }}:<br />
      {{ state.eventData }}
    </p>
  </div>
</template>
