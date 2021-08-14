<template>
  <div
    class="pinch-scroll-zoom"
    :class="{
      'pinch-scroll-zoom--zoom-out': zoomOut,
      'pinch-scroll-zoom--zoom-in': zoomIn,
    }"
    @mousedown="startDrag"
    @mousemove="doDrag"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <div
      ref="content"
      class="pinch-scroll-zoom__content"
      :style="getContainerStyle()"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import _ from "lodash";
import PinchScrollZoomAxis from "./pinch-scroll-zoom-axis";
import Vue from "vue";
import { PinchScrollZoomEmitData, PinchScrollZoomSetData } from "./types";

export default /*#__PURE__*/ Vue.extend({
  name: "PinchScrollZoom",
  props: {
    contentWidth: {
      type: Number,
      default: undefined,
    },
    contentHeight: {
      type: Number,
      default: undefined,
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
      default: 0.001,
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    scale(val: number): void {
      //this.currentScale = val;
      this.submitScale(val);
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
      this.checkWithin();
    },
  },
  data(): any {
    return {
      touch1: false,
      touch2: false,
      currentScale: this.scale,
      startScale: this.scale,
      axisX: new PinchScrollZoomAxis(
        this.width,
        this.originX,
        this.translateX,
        this.contentWidth
      ),
      axisY: new PinchScrollZoomAxis(
        this.height,
        this.originY,
        this.translateY,
        this.contentHeight
      ),
      throttleDoDrag: _.throttle((this as any).doDragEvent, this.throttleDelay),
      stopScalling: _.debounce((this as any).doStopScallingEvent, 200),
      zoomIn: false,
      zoomOut: false,
      stopDragListener: false,
      startDragListener: false,
      draggingListener: false,
      scallingListener: false,
    };
  },
  methods: {
    setData(data: PinchScrollZoomSetData) {
      this.currentScale = data.scale;
      this.axisX.setPoint(data.translateX);
      this.axisY.setPoint(data.translateY);
      this.axisX.setOrigin(data.originX);
      this.axisY.setOrigin(data.originY);
    },
    getEmitData(): PinchScrollZoomEmitData {
      return {
        x: this.axisX.point,
        y: this.axisY.point,
        scale: this.currentScale,
        originX: this.axisX.origin,
        originY: this.axisY.origin,
        translateX: this.axisX.point,
        translateY: this.axisY.point,
      };
    },
    stopDrag(): void {
      this.touch1 = false;
      this.touch2 = false;
      this.zoomIn = false;
      this.zoomOut = false;
      if (this.stopDragListener) {
        this.$emit("stopDrag", this.getEmitData());
      }
    },
    startDrag(touchEvent: any): void {
      if (!this.draggable) return;

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
      const clientX1 = this.getBoundingTouchClientX(touchEvent.touches[0]);
      const clientY1 = this.getBoundingTouchClientY(touchEvent.touches[0]);
      if (touchEvent.touches.length > 1) {
        this.touch1 = true;
        this.touch2 = true;
        this.startScale = this.currentScale;

        const clientX2 = this.getBoundingTouchClientX(touchEvent.touches[1]);
        const clientY2 = this.getBoundingTouchClientY(touchEvent.touches[1]);

        this.axisX.pinch(clientX1, clientX2, this.currentScale);
        this.axisY.pinch(clientY1, clientY2, this.currentScale);
      } else {
        this.touch1 = true;
        this.touch2 = false;
        this.axisX.touch(clientX1);
        this.axisY.touch(clientY1);
      }

      if (this.startDragListener) {
        this.$emit("startDrag", this.getEmitData());
      }
    },
    doDrag(touchEvent: any): void {
      if (!this.draggable) return;

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
          this.getBoundingTouchClientX(touchEvent.touches[0]),
          this.getBoundingTouchClientX(touchEvent.touches[1])
        );
        this.axisY.dragPinch(
          this.getBoundingTouchClientY(touchEvent.touches[0]),
          this.getBoundingTouchClientY(touchEvent.touches[1])
        );
      } else {
        this.axisX.dragTouch(
          this.getBoundingTouchClientX(touchEvent.touches[0])
        );
        this.axisY.dragTouch(
          this.getBoundingTouchClientY(touchEvent.touches[0])
        );
      }

      this.doScale(touchEvent);
      this.submitDrag();
    },
    getBoundingTouchClientX(touch: any): number {
      return touch.clientX - this.$el.getBoundingClientRect().left;
    },
    getBoundingTouchClientY(touch: any): number {
      return touch.clientY - this.$el.getBoundingClientRect().top;
    },
    submitDrag(): void {
      if (this.draggingListener) {
        this.$emit("dragging", this.getEmitData());
      }
    },
    getDistance(x1: number, y1: number, x2: number, y2: number): number {
      const sqrDistance = (x1 - x2) ** 2 + (y1 - y2) ** 2;
      const distance = Math.sqrt(sqrDistance);
      return distance;
    },
    doScale(touchEvent: any): void {
      if (touchEvent.touches.length < 2 || !this.touch1 || !this.touch2) {
        this.checkWithin();
        return;
      }

      const touch1 = touchEvent.touches[0];
      const touch2 = touchEvent.touches[1];

      const distance = this.getDistance(
        this.getBoundingTouchClientX(touch1),
        this.getBoundingTouchClientY(touch1),
        this.getBoundingTouchClientX(touch2),
        this.getBoundingTouchClientY(touch2)
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
          this.zoomIn = this.currentScale < scale;
          this.zoomOut = this.currentScale > scale;
          this.currentScale = scale;
          this.stopScalling();
        }
      }
      this.checkWithin();
      if (this.scallingListener) {
        this.$emit("scalling", this.getEmitData());
      }
    },
    doWheelScale(event: any): void {
      event.preventDefault();
      const clientX = this.getBoundingTouchClientX(event);
      const clientY = this.getBoundingTouchClientY(event);
      this.axisX.pinch(clientX, clientX, this.currentScale);
      this.axisY.pinch(clientY, clientY, this.currentScale);

      const factor = 1 - event.deltaY * this.wheelVelocity;
      const scale = this.currentScale * factor;

      this.submitScale(scale);
    },
    checkWithin() {
      if (!this.within) {
        return;
      }

      this.axisY.checkAndResetToWithin(this.currentScale);
      this.axisX.checkAndResetToWithin(this.currentScale);
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

    this.stopDragListener = !!this.$listeners.stopDrag;
    this.startDragListener = !!this.$listeners.startDrag;
    this.draggingListener = !!this.$listeners.dragging;
    this.scallingListener = !!this.$listeners.scalling;
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
      pointer-events: none;
    }
  }
}
</style>
