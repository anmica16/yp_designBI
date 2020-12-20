<template>
  <div
    :style="style"
    class="DragResizeMouse-wrap"
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
  >
    <div
      class="DragResizeMouse-event"
      @mousedown.prevent="dragResizeMouseDown"
      @mousemove.self="dragResizeMouseMove"
      @mouseout="dragResizeMouseMoveNotHover"
      @touchstart.prevent="dragResizeTouchDown"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script>
import DragResizeBase from "../mixin";
//("vue-draggable-resizable");

export default {
  name: "DragResizeMouse",
  mixins: [DragResizeBase]
};
</script>

<style lang="scss">
.DragResizeMouse-wrap {
  box-sizing: border-box;
  .DragResizeMouse-event {
    width: 100%;
    height: 100%;
  }
}
</style>
