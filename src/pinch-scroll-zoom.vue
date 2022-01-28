<template>
  <div
    class="pinch-scroll-zoom"
    :class="componentClass"
    @mousedown="startDrag"
    @mousemove="doDrag"
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

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { throttle, debounce, DebouncedFunc } from "lodash";
import PinchScrollZoomAxis from "./pinch-scroll-zoom-axis";
import { PinchScrollZoomEmitData, PinchScrollZoomSetData } from "./types";

@Component({
  name: "PinchScrollZoom",
})
export default class PinchScrollZoom extends Vue {
  @Prop({ required: false }) private contentWidth!: number | undefined;
  @Prop({ required: false }) private contentHeight!: number | undefined;
  @Prop({ required: true }) private width!: number;
  @Prop({ required: true }) private height!: number;
  @Prop({ required: false }) private originX!: number | undefined;
  @Prop({ required: false }) private originY!: number | undefined;
  @Prop({ required: false, default: 0 }) private translateX!: number;
  @Prop({ required: false, default: 0 }) private translateY!: number;
  @Prop({ required: false, default: 1 }) private scale!: number;

  @Prop({ required: false, default: 25 }) private throttleDelay!: number;
  @Prop({ required: false, default: true }) private within!: boolean;
  @Prop({ required: false, default: 0.3 }) private minScale!: number;
  @Prop({ required: false, default: 5 }) private maxScale!: number;
  @Prop({ required: false, default: 0.001 }) private wheelVelocity!: number;
  @Prop({ required: false, default: true }) private draggable!: boolean;

  private touch1: boolean = false;
  private touch2: boolean = false;
  private currentScale: number = this.scale;
  private startScale: number = this.scale;
  private axisX: PinchScrollZoomAxis = new PinchScrollZoomAxis(
    this.width,
    this.originX,
    this.translateX,
    this.contentWidth
  );
  private axisY: PinchScrollZoomAxis = new PinchScrollZoomAxis(
    this.height,
    this.originY,
    this.translateY,
    this.contentHeight
  );
  private throttleDoDrag: DebouncedFunc<any> = throttle(
    (this as any).doDragEvent,
    this.throttleDelay
  );
  private stopScaling: DebouncedFunc<any> = debounce(
    (this as any).doStopScalingEvent,
    200
  );
  private zoomIn: boolean = false;
  private zoomOut: boolean = false;
  private stopDragListener: boolean = false;
  private startDragListener: boolean = false;
  private draggingListener: boolean = false;
  private scalingListener: boolean = false;

  public get componentStyle(): object {
    return {
      width: `${this.width}px`,
      height: `${this.height}px`,
    };
  }

  public get componentClass(): object {
    return {
      "pinch-scroll-zoom--zoom-out": this.zoomOut,
      "pinch-scroll-zoom--zoom-in": this.zoomIn,
    };
  }

  public get containerStyle(): object {
    const x = `${this.axisX.point}px`;
    const y = `${this.axisY.point}px`;
    const translate = `translate(${x}, ${y}) scale(${this.currentScale})`;
    const transformOrigin = `${this.axisX.origin}px ${this.axisY.origin}px`;

    return {
      transform: translate,
      "transform-origin": transformOrigin,
    };
  }

  @Watch("scale")
  scaleChanged(val: number): void {
    this.submitScale(val);
  }

  @Watch("translateX")
  translateXchanged(val: number): void {
    this.axisX.setPoint(val);
  }

  @Watch("translateY")
  translateYchanged(val: number): void {
    this.axisY.setPoint(val);
  }

  @Watch("originX")
  originXchanged(val: number): void {
    this.axisX.setOrigin(val);
  }
  @Watch("originY")
  originYchanged(val: number): void {
    this.axisY.setOrigin(val);
  }
  @Watch("within")
  withinChanged(): void {
    this.checkWithin();
  }

  public setData(data: PinchScrollZoomSetData): void {
    this.currentScale = data.scale;
    this.axisX.setPoint(data.translateX);
    this.axisY.setPoint(data.translateY);
    this.axisX.setOrigin(data.originX);
    this.axisY.setOrigin(data.originY);
  }

  public getEmitData(): PinchScrollZoomEmitData {
    return {
      x: this.axisX.point,
      y: this.axisY.point,
      scale: this.currentScale,
      originX: this.axisX.origin,
      originY: this.axisY.origin,
      translateX: this.axisX.point,
      translateY: this.axisY.point,
    };
  }

  public stopDrag(): void {
    this.touch1 = false;
    this.touch2 = false;
    this.zoomIn = false;
    this.zoomOut = false;
    if (this.stopDragListener) {
      this.$emit("stopDrag", this.getEmitData());
    }
  }

  public startDrag(touchEvent: any): void {
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
  }

  public doDrag(touchEvent: any): void {
    if (!this.draggable) return;

    this.throttleDoDrag(touchEvent);
  }

  public doStopScalingEvent(): void {
    this.zoomIn = false;
    this.zoomOut = false;
  }

  public doDragEvent(touchEvent: any): void {
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
      this.axisX.dragTouch(this.getBoundingTouchClientX(touchEvent.touches[0]));
      this.axisY.dragTouch(this.getBoundingTouchClientY(touchEvent.touches[0]));
    }

    this.doScale(touchEvent);
    this.submitDrag();
  }

  public getBoundingTouchClientX(touch: any): number {
    return touch.clientX - this.$el.getBoundingClientRect().left;
  }

  public getBoundingTouchClientY(touch: any): number {
    return touch.clientY - this.$el.getBoundingClientRect().top;
  }

  public submitDrag(): void {
    if (this.draggingListener) {
      this.$emit("dragging", this.getEmitData());
    }
  }

  public getDistance(x1: number, y1: number, x2: number, y2: number): number {
    const sqrDistance = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    const distance = Math.sqrt(sqrDistance);
    return distance;
  }

  public doScale(touchEvent: any): void {
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
  }

  public submitScale(scale: number): void {
    if (
      (scale >= this.minScale || this.currentScale < scale) &&
      (scale <= this.maxScale || this.currentScale > scale)
    ) {
      if (this.currentScale != scale) {
        this.zoomIn = this.currentScale < scale;
        this.zoomOut = this.currentScale > scale;
        this.currentScale = scale;
        this.stopScaling();
      }
    }
    this.checkWithin();
    if (this.scalingListener) {
      this.$emit("scaling", this.getEmitData());
    }
  }

  public doWheelScale(event: any): void {
    event.preventDefault();
    const clientX = this.getBoundingTouchClientX(event);
    const clientY = this.getBoundingTouchClientY(event);
    this.axisX.pinch(clientX, clientX, this.currentScale);
    this.axisY.pinch(clientY, clientY, this.currentScale);

    const factor = 1 - event.deltaY * this.wheelVelocity;
    const scale = this.currentScale * factor;

    this.submitScale(scale);
  }

  public checkWithin(): void {
    if (!this.within) {
      return;
    }

    this.axisY.checkAndResetToWithin(this.currentScale);
    this.axisX.checkAndResetToWithin(this.currentScale);
  }

  mounted() {
    window.addEventListener("mouseup", this.stopDrag);
    this.$el.addEventListener("touchstart", this.startDrag);
    this.$el.addEventListener("touchmove", this.doDrag);
    this.$el.addEventListener("wheel", this.doWheelScale);

    this.stopDragListener = !!this.$listeners.stopDrag;
    this.startDragListener = !!this.$listeners.startDrag;
    this.draggingListener = !!this.$listeners.dragging;
    this.scalingListener = !!this.$listeners.scaling;
  }

  beforeDestroy() {
    window.removeEventListener("mouseup", this.stopDrag);
    this.$el.removeEventListener("touchstart", this.startDrag);
    this.$el.removeEventListener("touchmove", this.doDrag);
    this.$el.removeEventListener("wheel", this.doWheelScale);
  }
}
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
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
    }
  }
}
</style>
