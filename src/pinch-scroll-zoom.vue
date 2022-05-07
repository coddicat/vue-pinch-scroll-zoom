<template>
  <div
    ref="el"
    class="pinch-scroll-zoom"
    :class="componentClass"
    :style="componentStyle"
    @mousedown="startDrag"
    @mousemove="doDrag"
  >
    <div
      ref="content"
      class="pinch-scroll-zoom__content"
      :style="containerStyle"
    >
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  watch,
  ref,
  onMounted,
  onUnmounted,
} from "vue";
import PinchScrollZoomAxis from "./pinch-scroll-zoom-axis";
import { throttle, debounce } from "lodash";
import { PinchScrollZoomEmitData, PinchScrollZoomSetData } from "./entry.esm";

export default defineComponent({
  name: "PinchScrollZoom",
  props: {
    contentWidth: {
      type: Number,
      required: false,
      default: 0,
    },
    contentHeight: {
      type: Number,
      required: false,
      default: 0,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    originX: {
      type: Number,
      required: false,
      default: undefined,
    },
    originY: {
      type: Number,
      required: false,
      default: undefined,
    },
    translateX: {
      type: Number,
      required: false,
      default: 0,
    },
    translateY: {
      type: Number,
      required: false,
      default: 0,
    },
    scale: {
      type: Number,
      required: false,
      default: 1,
    },
    throttleDelay: {
      type: Number,
      required: false,
      default: 25,
    },
    within: {
      type: Boolean,
      required: false,
      default: true,
    },
    minScale: {
      type: Number,
      required: false,
      default: 0.3,
    },
    maxScale: {
      type: Number,
      required: false,
      default: 5,
    },
    wheelVelocity: {
      type: Number,
      required: false,
      default: 0.001,
    },
    draggable: {
      type: Boolean,
      required: false,
      default: true,
    },
    enableScaling: {
      type: Boolean,
      default: true,
    },
    enableStartDrag: {
      type: Boolean,
      default: true,
    },
    enableStopDrag: {
      type: Boolean,
      default: true,
    },
    enableDragging: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["stopDrag", "startDrag", "dragging", "scaling"],
  setup(props, ctx) {
    const el = ref<HTMLDivElement>();
    let touch1 = false;
    let touch2 = false;
    let currentScale = ref(props.scale);
    let startScale = ref(props.scale);

    const axisX = new PinchScrollZoomAxis(
      props.width,
      props.originX,
      props.translateX,
      props.contentWidth
    );
    const axisY = new PinchScrollZoomAxis(
      props.height,
      props.originY,
      props.translateY,
      props.contentHeight
    );
    let zoomIn = ref(false);
    let zoomOut = ref(false);
    let stopDragListener = false;
    let startDragListener = false;
    let draggingListener = false;
    let scalingListener = false;
    onMounted(() => {
      currentScale.value = props.scale;
      startScale.value = props.scale;
      window.addEventListener("mouseup", stopDrag);
      if (el.value) {
        el.value.addEventListener("touchstart", startDrag);
        el.value.addEventListener("touchmove", doDrag);
        el.value.addEventListener("wheel", doWheelScale);
      }

      stopDragListener = props.enableScaling;
      startDragListener = props.enableStartDrag;
      draggingListener = props.enableStopDrag;
      scalingListener = props.enableDragging;

      updateAxis();
    });

    onUnmounted(() => {
      window.removeEventListener("mouseup", stopDrag);
      if (el.value) {
        el.value.removeEventListener("touchstart", startDrag);
        el.value.removeEventListener("touchmove", doDrag);
        el.value.removeEventListener("wheel", doWheelScale);
      }
    });
    const componentStyle = computed(() => {
      return {
        width: `${props.width}px`,
        height: `${props.height}px`,
      };
    });
    const componentClass = computed(() => {
      return {
        "pinch-scroll-zoom--zoom-in": zoomIn,
        "pinch-scroll-zoom--zoom-out": zoomOut,
      };
    });
    const xPoint = ref(axisX.point);
    const yPoint = ref(axisY.point);
    const xOrigin = ref(axisX.origin);
    const yOrigin = ref(axisY.origin);
    const updateAxis = () => {
      xPoint.value = axisX.point;
      yPoint.value = axisY.point;
      xOrigin.value = axisX.origin;
      yOrigin.value = axisY.origin;
    };
    const containerStyle = computed(() => {
      const x = `${xPoint.value}px`;
      const y = `${yPoint.value}px`;
      const translate = `translate(${x}, ${y}) scale(${currentScale.value})`;
      const transformOrigin = `${xOrigin.value}px ${yOrigin.value}px`;
      return {
        transform: translate,
        "transform-origin": transformOrigin,
      };
    });
    const getEmitData = (): PinchScrollZoomEmitData => {
      return {
        x: axisX.point,
        y: axisY.point,
        scale: currentScale.value,
        originX: axisX.origin,
        originY: axisY.origin,
        translateX: axisX.point,
        translateY: axisY.point,
      };
    };
    const stopDrag = (): void => {
      touch1 = false;
      touch2 = false;
      zoomIn.value = false;
      zoomOut.value = false;
      if (stopDragListener) {
        ctx.emit("stopDrag", getEmitData());
      }
    };
    const getBoundingTouchClientX = (touch: any): number => {
      if (el.value) {
        return touch.clientX - el.value.getBoundingClientRect().left;
      }
      return 0;
    };
    const getBoundingTouchClientY = (touch: any): number => {
      if (el.value) {
        return touch.clientY - el.value.getBoundingClientRect().top;
      }
      return 0;
    };
    const startDrag = (touchEvent: any): void => {
      if (!props.draggable) {
        return;
      }
      if (!touchEvent.touches) {
        touchEvent.touches = [
          {
            clientX: touchEvent.clientX,
            clientY: touchEvent.clientY,
          },
        ];
      }
      if (touchEvent.touches.length == 0) {
        stopDrag();
        return;
      }
      const clientX1 = getBoundingTouchClientX(touchEvent.touches[0]);
      const clientY1 = getBoundingTouchClientY(touchEvent.touches[0]);
      if (touchEvent.touches.length > 1) {
        touch1 = true;
        touch2 = true;
        startScale.value = currentScale.value;
        const clientX2 = getBoundingTouchClientX(touchEvent.touches[1]);
        const clientY2 = getBoundingTouchClientY(touchEvent.touches[1]);
        axisX.pinch(clientX1, clientX2, currentScale.value);
        axisY.pinch(clientY1, clientY2, currentScale.value);
      } else {
        touch1 = true;
        touch2 = false;
        axisX.touch(clientX1);
        axisY.touch(clientY1);
      }
      if (startDragListener) {
        ctx.emit("startDrag", getEmitData());
      }
    };
    const doDrag = (touchEvent: any): void => {
      if (!props.draggable) return;
      throttleDoDrag(touchEvent);
    };
    const doStopScalingEvent = (): void => {
      zoomIn.value = false;
      zoomOut.value = false;
    };
    const doDragEvent = (touchEvent: any): void => {
      if (!touch1 && !touch2) return;
      if (!touchEvent.touches) {
        touchEvent.touches = [
          {
            clientX: touchEvent.clientX,
            clientY: touchEvent.clientY,
          },
        ];
      }
      if (touchEvent.touches.length === 0) return;
      if (touch1 && touch2 && touchEvent.touches.length === 1) {
        startDrag(touchEvent);
      }
      if (!touch1 || (!touch2 && touchEvent.touches.length === 2)) {
        startDrag(touchEvent);
      }
      if (touch1 && touch2) {
        axisX.dragPinch(
          getBoundingTouchClientX(touchEvent.touches[0]),
          getBoundingTouchClientX(touchEvent.touches[1])
        );
        axisY.dragPinch(
          getBoundingTouchClientY(touchEvent.touches[0]),
          getBoundingTouchClientY(touchEvent.touches[1])
        );
      } else {
        axisX.dragTouch(getBoundingTouchClientX(touchEvent.touches[0]));
        axisY.dragTouch(getBoundingTouchClientY(touchEvent.touches[0]));
      }
      updateAxis();
      doScale(touchEvent);
      submitDrag();
    };
    const throttleDoDrag = throttle(doDragEvent, props.throttleDelay);
    const stopScaling = debounce(doStopScalingEvent, 200);
    const submitDrag = (): void => {
      updateAxis();
      if (draggingListener) {
        ctx.emit("dragging", getEmitData());
      }
    };
    const getDistance = (
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ): number => {
      const sqrDistance = (x1 - x2) ** 2 + (y1 - y2) ** 2;
      const distance = Math.sqrt(sqrDistance);
      return distance;
    };
    const doScale = (touchEvent: any): void => {
      if (touchEvent.touches.length < 2 || !touch1 || !touch2) {
        checkWithin();
        return;
      }
      const t1 = touchEvent.touches[0];
      const t2 = touchEvent.touches[1];
      const distance = getDistance(
        getBoundingTouchClientX(t1),
        getBoundingTouchClientY(t1),
        getBoundingTouchClientX(t2),
        getBoundingTouchClientY(t2)
      );
      const startDistance = getDistance(
        axisX.start1,
        axisY.start1,
        axisX.start2,
        axisY.start2
      );
      const scale = startScale.value * (distance / startDistance);
      submitScale(scale);
    };
    const submitScale = (scale: number): void => {
      if (
        (scale >= props.minScale || currentScale.value < scale) &&
        (scale <= props.maxScale || currentScale.value > scale)
      ) {
        if (currentScale.value != scale) {
          zoomIn.value = currentScale.value < scale;
          zoomOut.value = currentScale.value > scale;
          currentScale.value = scale;
          stopScaling();
        }
      }
      updateAxis();
      checkWithin();
      if (scalingListener) {
        ctx.emit("scaling", getEmitData());
      }
    };
    const doWheelScale = (event: any): void => {
      event.preventDefault();
      const clientX = getBoundingTouchClientX(event);
      const clientY = getBoundingTouchClientY(event);
      axisX.pinch(clientX, clientY, currentScale.value);
      axisY.pinch(clientX, clientY, currentScale.value);
      const factor = 1 - event.deltaY * props.wheelVelocity;
      const scale = currentScale.value * factor;
      submitScale(scale);
    };
    const checkWithin = (): void => {
      if (!props.within) {
        return;
      }
      axisX.checkAndResetToWithin(currentScale.value);
      axisY.checkAndResetToWithin(currentScale.value);
    };

    const setData = (data: PinchScrollZoomSetData): void => {
      currentScale.value = data.scale;
      axisX.setPoint(data.translateX);
      axisY.setPoint(data.translateY);
      axisX.setOrigin(data.originX);
      axisY.setOrigin(data.originY);
      updateAxis();
    };

    watch(
      () => props.scale,
      (val: number) => {
        submitScale(val);
      }
    );
    watch(
      () => props.translateX,
      (val: number) => {
        axisX.setPoint(val);
      }
    );
    watch(
      () => props.translateY,
      (val: number) => {
        axisY.setPoint(val);
      }
    );
    watch(
      () => props.originX,
      (val: any) => {
        axisX.setOrigin(val);
      }
    );
    watch(
      () => props.originY,
      (val: any) => {
        axisY.setOrigin(val);
      }
    );
    watch(
      () => props.within,
      () => {
        checkWithin();
      }
    );
    return {
      componentStyle,
      componentClass,
      containerStyle,
      startDrag,
      doDrag,
      setData,
      el,
      currentScale,
    };
  },
});
</script>

<style>
.pinch-scroll-zoom {
  position: relative;
  touch-action: none;
  user-select: none;
  user-zoom: none;
  overflow: hidden;
}
.pinch-scroll-zoom :active {
  cursor: all-scroll;
}
.pinch-scroll-zoom--zoom-in {
  cursor: zoom-in;
}
.pinch-scroll-zoom--zoom-out {
  cursor: zoom-out;
}
.pinch-scroll-zoom__content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.pinch-scroll-zoom__content img {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
}
</style>
