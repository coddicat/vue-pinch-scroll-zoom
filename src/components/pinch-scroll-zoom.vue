<script setup lang="ts">
import { throttle, debounce } from 'lodash';
import PinchScrollZoomAxis from './pinch-scroll-zoom-axis';
import {
  PinchScrollZoomExposed,
  PinchScrollZoomEmitData,
  PinchScrollZoomSetData
} from './types';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from 'vue';
import { getDistance } from './pinch-scroll-zoom-ext';

const props = withDefaults(
  defineProps<{
    contentWidth?: number;
    contentHeight?: number;
    width: number;
    height: number;
    originX?: number;
    originY?: number;
    translateX?: number;
    translateY?: number;
    scale?: number;
    throttleDelay?: number;
    within?: boolean;
    minScale?: number;
    maxScale?: number;
    wheelVelocity?: number;
    draggable?: boolean;
  }>(),
  {
    translateX: 0,
    translateY: 0,
    scale: 1,
    throttleDelay: 25,
    within: true,
    minScale: 0.3,
    maxScale: 5,
    wheelVelocity: 0.001,
    draggable: true
  }
);

const $el = ref<HTMLDivElement>();

const throttleDoDrag = throttle(doDragEvent, props.throttleDelay);
const stopScaling = debounce(doStopScalingEvent, 200);

const state = reactive({
  touch1: false,
  touch2: false,
  currentScale: props.scale,
  startScale: props.scale,
  zoomIn: false,
  zoomOut: false,
  axisX: new PinchScrollZoomAxis({
    size: props.width,
    origin: props.originX,
    translate: props.translateX,
    contentSize: props.contentWidth
  }),
  axisY: new PinchScrollZoomAxis({
    size: props.height,
    origin: props.originY,
    translate: props.translateY,
    contentSize: props.contentHeight
  })
});

const componentClass = computed(() => ({
  'pinch-scroll-zoom--zoom-out': state.zoomOut,
  'pinch-scroll-zoom--zoom-in': state.zoomIn
}));

const componentStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`
}));

const containerStyle = computed(() => {
  const x = `${state.axisX.point}px`;
  const y = `${state.axisY.point}px`;
  const translate = `translate(${x}, ${y}) scale(${state.currentScale})`;
  const transformOrigin = `${state.axisX.origin}px ${state.axisY.origin}px`;

  return {
    transform: translate,
    'transform-origin': transformOrigin
  };
});

const emit = defineEmits<{
  (event: 'stopDrag', payload: PinchScrollZoomEmitData): void;
  (event: 'startDrag', payload: PinchScrollZoomEmitData): void;
  (event: 'dragging', payload: PinchScrollZoomEmitData): void;
  (event: 'scaling', payload: PinchScrollZoomEmitData): void;
}>();

defineExpose({
  setData
} as PinchScrollZoomExposed);

function setData(data: PinchScrollZoomSetData): void {
  state.currentScale = data.scale;
  state.axisX.setPoint(data.translateX);
  state.axisY.setPoint(data.translateY);
  state.axisX.setOrigin(data.originX);
  state.axisY.setOrigin(data.originY);
}

function getEmitData(): PinchScrollZoomEmitData {
  return {
    x: state.axisX.point,
    y: state.axisY.point,
    scale: state.currentScale,
    originX: state.axisX.origin,
    originY: state.axisY.origin,
    translateX: state.axisX.point,
    translateY: state.axisY.point
  };
}

function stopDrag(): void {
  state.touch1 = false;
  state.touch2 = false;
  state.zoomIn = false;
  state.zoomOut = false;
  emit('stopDrag', getEmitData());
}

function startMouseDrag(mouseEvent: MouseEvent): void {
  if (!props.draggable) return;
  const touches = [
    {
      clientX: mouseEvent.clientX,
      clientY: mouseEvent.clientY
    }
  ];
  startDrag(touches);
}

function startTouchDrag(touchEvent: TouchEvent): void {
  if (!props.draggable) return;
  const touches = Array.from(touchEvent.touches);
  startDrag(touches);
}

function startDrag(touches: { clientX: number; clientY: number }[]): void {
  if (touches.length === 0) {
    stopDrag();
    return;
  }
  const clientX1 = getBoundingTouchClientX(touches[0]);
  const clientY1 = getBoundingTouchClientY(touches[0]);
  if (touches.length > 1) {
    state.touch1 = true;
    state.touch2 = true;
    state.startScale = state.currentScale;

    const clientX2 = getBoundingTouchClientX(touches[1]);
    const clientY2 = getBoundingTouchClientY(touches[1]);

    state.axisX.pinch(clientX1, clientX2, state.currentScale);
    state.axisY.pinch(clientY1, clientY2, state.currentScale);
  } else {
    state.touch1 = true;
    state.touch2 = false;
    state.axisX.touch(clientX1);
    state.axisY.touch(clientY1);
  }

  emit('startDrag', getEmitData());
}

function doDragEvent(touches: { clientX: number; clientY: number }[]): void {
  if (!state.touch1 && !state.touch2) return;
  // if (!touchEvent.touches) {
  //   touchEvent.touches = [
  //     {
  //       clientX: touchEvent.clientX,
  //       clientY: touchEvent.clientY,
  //     },
  //   ];
  // }
  if (touches.length === 0) return;

  if (state.touch1 && state.touch2 && touches.length === 1) startDrag(touches);

  if (!state.touch1 || (!state.touch2 && touches.length === 2))
    startDrag(touches);

  if (state.touch1 && state.touch2) {
    state.axisX.dragPinch(
      getBoundingTouchClientX(touches[0]),
      getBoundingTouchClientX(touches[1])
    );
    state.axisY.dragPinch(
      getBoundingTouchClientY(touches[0]),
      getBoundingTouchClientY(touches[1])
    );
  } else {
    state.axisX.dragTouch(getBoundingTouchClientX(touches[0]));
    state.axisY.dragTouch(getBoundingTouchClientY(touches[0]));
  }

  doScale(touches);
  submitDrag();
}

function submitDrag(): void {
  emit('dragging', getEmitData());
}

function doStopScalingEvent(): void {
  state.zoomIn = false;
  state.zoomOut = false;
}

function getBoundingTouchClientX(touch: { clientX: number }): number {
  return touch.clientX - $el.value!.getBoundingClientRect().left;
}

function getBoundingTouchClientY(touch: { clientY: number }): number {
  return touch.clientY - $el.value!.getBoundingClientRect().top;
}

function doScale(touches: { clientX: number; clientY: number }[]): void {
  if (touches.length < 2 || !state.touch1 || !state.touch2) {
    checkWithin();
    return;
  }

  const touch1 = touches[0];
  const touch2 = touches[1];

  const distance = getDistance(
    getBoundingTouchClientX(touch1),
    getBoundingTouchClientY(touch1),
    getBoundingTouchClientX(touch2),
    getBoundingTouchClientY(touch2)
  );

  const startDistance = getDistance(
    state.axisX.start1,
    state.axisY.start1,
    state.axisX.start2,
    state.axisY.start2
  );

  const scale = state.startScale * (distance / startDistance);
  submitScale(scale);
}

function submitScale(scale: number): void {
  if (
    (scale >= props.minScale || state.currentScale < scale) &&
    (scale <= props.maxScale || state.currentScale > scale)
  ) {
    if (state.currentScale !== scale) {
      state.zoomIn = state.currentScale < scale;
      state.zoomOut = state.currentScale > scale;
      state.currentScale = scale;
      stopScaling();
    }
  }
  checkWithin();
  emit('scaling', getEmitData());
}

function checkWithin(): void {
  if (!props.within) {
    return;
  }

  state.axisY.checkAndResetToWithin(state.currentScale);
  state.axisX.checkAndResetToWithin(state.currentScale);
}

function doMouseDrag(mouseEvent: MouseEvent): void {
  if (!props.draggable) return;
  const touches = [
    {
      clientX: mouseEvent.clientX,
      clientY: mouseEvent.clientY
    }
  ];
  throttleDoDrag(touches);
}

function doTouchDrag(touchEvent: TouchEvent): void {
  if (!props.draggable) return;
  const touches = Array.from(touchEvent.touches);
  throttleDoDrag(touches);
}

function doWheelScale(event: WheelEvent): void {
  event.preventDefault();
  const clientX = getBoundingTouchClientX(event);
  const clientY = getBoundingTouchClientY(event);
  state.axisX.pinch(clientX, clientX, state.currentScale);
  state.axisY.pinch(clientY, clientY, state.currentScale);

  const factor = 1 - event.deltaY * props.wheelVelocity;
  const scale = state.currentScale * factor;

  submitScale(scale);
}

onMounted(() => {
  window.addEventListener('mouseup', stopDrag);
});

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', stopDrag);
});

watch(() => props.scale, submitScale);
watch(() => props.translateX, state.axisX.setPoint);
watch(() => props.translateY, state.axisY.setPoint);
watch(
  () => props.originX,
  (val?: number) => state.axisX.setOrigin(val ?? 0)
);
watch(
  () => props.originY,
  (val?: number) => state.axisY.setOrigin(val ?? 0)
);
watch(() => props.within, checkWithin);
</script>

<template>
  <div
    ref="$el"
    class="pinch-scroll-zoom"
    :class="componentClass"
    @mousedown="startMouseDrag"
    @mousemove="doMouseDrag"
    @touchstart="startTouchDrag"
    @touchmove="doTouchDrag"
    @wheel="doWheelScale"
    :style="componentStyle"
  >
    <div
      ref="content"
      class="pinch-scroll-zoom__content"
      :style="containerStyle"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
.pinch-scroll-zoom {
  position: relative;
  touch-action: none;
  user-select: none;
  user-zoom: none;
  overflow: hidden;
  :active {
    cursor: all-scroll;
  }

  &--zoom-in {
    cursor: zoom-in;
  }

  &--zoom-out {
    cursor: zoom-out;
  }

  &__content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    img {
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
    }
  }
}
</style>
