<template>
  <div
    class="vue-pinch-scroll-zoom"
    :class="{
      'vue-pinch-scroll-zoom--zoom-out': zoomOut,
      'vue-pinch-scroll-zoom--zoom-in': zoomIn,
    }"
    @mousedown="startDrag"
    @mousemove="doDrag"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <div class="vue-pinch-scroll-zoom__content" :style="getContainerStyle()">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import _ from "lodash";
import PinchScrollZoomAxis from "./pinch-scroll-zoom-axis";
import Vue from "vue";
import { PinchScrollZoomEmitData } from "./types";

export default /*#__PURE__*/ Vue.extend({
  name: "PinchScrollZoom",
  props: {
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
    },
    originY: {
      type: Number,
      required: false,
    },
    translateX: {
      type: Number,
      default: 0,
    },
    translateY: {
      type: Number,
      default: 0,
    },
    scale: {
      type: Number,
      default: 1,
    },
    throttleDelay: {
      type: Number,
      default: 25,
    },
    within: {
      type: Boolean,
      default: true,
    },
    minScale: {
      type: Number,
      default: 0.3,
    },
    maxScale: {
      type: Number,
      default: 5,
    },
    wheelVelocity: {
      type: Number,
      default: 0.001
    }
  },
  watch: {
    scale(val: number): void {
      this.currentScale = val;
    },
    translateY(val: number): void {
      this.axisY.setPoint(val);
    },
    translateX(val: number): void {
      this.axisX.setPoint(val);
    },
    originX(val: number): void {
      this.axisX.setOrigin(val);
    },
    originY(val: number): void {
      this.axisY.setOrigin(val);
    },
    within(): void {
      this.checkReset();
    },
  },
  data(): any {
    return {
      touch1: false,
      touch2: false,
      currentScale: this.scale,
      startScale: this.scale,
      axisX: new PinchScrollZoomAxis(this.width, this.originX, this.translateX),
      axisY: new PinchScrollZoomAxis(
        this.height,
        this.originY,
        this.translateY
      ),
      throttleDoDrag: _.throttle((this as any).doDragEvent, this.throttleDelay),
      stopScalling: _.debounce((this as any).doStopScallingEvent, 200),
      zoomIn: false,
      zoomOut: false,
    };
  },
  methods: {
    getEmitData(): PinchScrollZoomEmitData {
      return {
        x: this.axisX.point,
        y: this.axisY.point,
        scale: this.currentScale,
        originX: this.axisX.origin,
        originY: this.axisY.origin,
      };
    },
    stopDrag(): void {
      this.touch1 = false;
      this.touch2 = false;
      this.zoomIn = false;
      this.zoomOut = false;
      this.$emit("stopDrag", this.getEmitData());
    },
    startDrag(touchEvent: any): void {
      if (!touchEvent.touches) {
        touchEvent.touches = [
          {
            clientX: touchEvent.clientX,
            clientY: touchEvent.clientY,
          },
        ];
      }
      if (touchEvent.touches.length == 0) {
        this.stopDrag();
        return;
      }
      const clientX1 = touchEvent.touches[0].clientX;
      const clientY1 = touchEvent.touches[0].clientY;
      if (touchEvent.touches.length > 1) {
        this.touch1 = true;
        this.touch2 = true;
        this.startScale = this.currentScale;

        const clientX2 = touchEvent.touches[1].clientX;
        const clientY2 = touchEvent.touches[1].clientY;

        this.axisX.pinch(clientX1, clientX2, this.currentScale);
        this.axisY.pinch(clientY1, clientY2, this.currentScale);
      } else {
        this.touch1 = true;
        this.touch2 = false;
        this.axisX.touch(clientX1);
        this.axisY.touch(clientY1);
      }

      this.$emit("startDrag", this.getEmitData());
    },
    doDrag(touchEvent: any): void {
      this.throttleDoDrag(touchEvent);
    },
    doStopScallingEvent() {
      this.zoomIn = false;
      this.zoomOut = false;
    },
    doDragEvent(touchEvent: any): void {
      if (!this.touch1 && !this.touch2) return;
      if (!touchEvent.touches) {
        touchEvent.touches = [
          {
            clientX: touchEvent.clientX,
            clientY: touchEvent.clientY,
          },
        ];
      }
      if (touchEvent.touches.length === 0) return;

      if (this.touch1 && this.touch2 && touchEvent.touches.length === 1)
        this.startDrag(touchEvent);

      if (!this.touch1 || (!this.touch2 && touchEvent.touches.length === 2))
        this.startDrag(touchEvent);

      if (this.touch1 && this.touch2) {
        this.axisX.dragPinch(
          touchEvent.touches[0].clientX,
          touchEvent.touches[1].clientX
        );
        this.axisY.dragPinch(
          touchEvent.touches[0].clientY,
          touchEvent.touches[1].clientY
        );
      } else {
        this.axisX.dragTouch(touchEvent.touches[0].clientX);
        this.axisY.dragTouch(touchEvent.touches[0].clientY);
      }

      this.doScale(touchEvent);
      this.submitDrag();
    },
    submitDrag(): void {
      this.$emit("dragging", this.getEmitData());
      this.$emit("update:translateX", this.axisX.point);
      this.$emit("update:translateY", this.axisY.point);
    },
    getDistance(x1: number, y1: number, x2: number, y2: number): number {
      const sqrDistance = (x1 - x2) ** 2 + (y1 - y2) ** 2;
      const distance = Math.sqrt(sqrDistance);
      return distance;
    },
    doScale(touchEvent: any): void {
      if (touchEvent.touches.length < 2 || !this.touch1 || !this.touch2) {
        this.checkReset();
        return;
      }

      const touch1 = touchEvent.touches[0];
      const touch2 = touchEvent.touches[1];

      const distance = this.getDistance(
        touch1.clientX,
        touch1.clientY,
        touch2.clientX,
        touch2.clientY
      );

      const startDistance = this.getDistance(
        this.axisX.start1,
        this.axisY.start1,
        this.axisX.start2,
        this.axisY.start2
      );

      const scale = this.startScale * (distance / startDistance);
      this.submitScale(scale);
    },
    submitScale(scale: number): void {
      if (
        (scale >= this.minScale || this.currentScale < scale) &&
        (scale <= this.maxScale || this.currentScale > scale)
      ) {
        if (this.currentScale != scale) {
          this.$emit("scalling", this.getEmitData());
          this.zoomIn = this.currentScale < scale;
          this.zoomOut = this.currentScale > scale;
          this.currentScale = scale;
          this.stopScalling();
        }
      }
      this.checkReset();

      this.$emit("update:originX", this.axisX.origin);
      this.$emit("update:originY", this.axisY.origin);
      this.$emit("update:scale", this.currentScale);
    },
    doWheelScale(event: any): void {
      event.preventDefault();
      this.axisX.pinch(event.clientX, event.clientX, this.currentScale);
      this.axisY.pinch(event.clientY, event.clientY, this.currentScale);

      const factor = 1 - event.deltaY * this.wheelVelocity;
      const scale = this.currentScale * factor;

      this.submitScale(scale);
    },
    checkReset() {
      if (!this.within) {
        return;
      }
      if (this.currentScale < 1) {
        this.axisX.resetOrigin();
        this.axisY.resetOrigin();
      }
      this.axisY.resetPoint(this.currentScale);
      this.axisX.resetPoint(this.currentScale);
    },
    getContainerStyle(): any {
      const x = `${this.axisX.point}px`;
      const y = `${this.axisY.point}px`;
      const translate = `translate(${x}, ${y}) scale(${this.currentScale})`;
      const transformOrigin = `${this.axisX.origin}px ${this.axisY.origin}px`;

      return {
        transform: translate,
        "transform-origin": transformOrigin,
      };
    },
  },
  mounted() {
    window.addEventListener("mouseup", this.stopDrag);
    this.$el.addEventListener("touchstart", this.startDrag);
    this.$el.addEventListener("touchmove", this.doDrag);
    this.$el.addEventListener("wheel", this.doWheelScale);
  },
  beforeDestroy() {
    window.removeEventListener("mouseup", this.stopDrag);
    this.$el.removeEventListener("touchstart", this.startDrag);
    this.$el.removeEventListener("touchmove", this.doDrag);
    this.$el.removeEventListener("wheel", this.doWheelScale);
  },
});
</script>

<style lang="scss">
.vue-pinch-scroll-zoom {
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
      pointer-events: none;
    }
  }
}
</style>
