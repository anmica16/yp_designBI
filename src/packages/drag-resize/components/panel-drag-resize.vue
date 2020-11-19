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
        [classNameResizable]: resizable,
      },
      className,
    ]"
    @mousedown.stop.prevent="resizeDownFn($event, true)"
    @mousemove="dragResizeMouseMove"
    @touchstart.stop.prevent="resizeDownFn($event, false)"
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
("vue-draggable-resizable");

export default {
  name: "panel-drag-resize",
  mixins: [DragResizeBase],
  props: {
    title: String,
  },
};
</script>
