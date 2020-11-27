<template>
  <div
    :style="style"
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
    @mousedown.prevent="dragResizeMouseDown"
    @mousemove.self="dragResizeMouseMove"
    @mouseout="dragResizeMouseMoveNotHover"
    @touchstart.prevent="dragResizeTouchDown"
  >
    <slot></slot>
  </div>
</template>

<script>
import DragResizeBase from "../mixin";
//("vue-draggable-resizable");

export default {
  name: "DragResize",
  mixins: [DragResizeBase]
};
</script>
