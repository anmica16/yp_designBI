<template>
  <div
    :style="style"
    class="panel-drag-resize"
    :class="[
      {
        [classNameActive]: enabled,
        [classNameDragging]: dragging,
        [classNameResizing]: resizing,
        [classNameDraggable]: draggable,
        [classNameResizable]: resizable
      },
      className
    ]"
    @mousedown="resizeDownFn($event, true)"
    @mousemove="dragResizeMouseMove"
    @touchstart="resizeDownFn($event, false)"
  >
    <div
      v-if="title"
      class="dragArea"
      @mousedown.stop.prevent="dragResizeMouseDown"
      @touchstart.stop.prevent="dragResizeTouchDown"
    >
      <div class="dragArea-title">{{ title }}</div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import DragResizeBase from "../mixin";
//("vue-draggable-resizable");

export default {
  name: "panel-drag-resize",
  mixins: [DragResizeBase],
  props: {
    title: String
  }
};
</script>

<style lang="scss">
// .panel-drag-resize {
//   position: relative; //会被里面的 absolute替代
//   .dragArea {
//     height: 100%;
//     width: 100%;
//   }
//   .inner {
//     position: absolute;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//   }
// }
</style>
