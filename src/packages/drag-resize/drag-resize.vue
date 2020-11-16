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
    @mousedown="dragResizeMouseDown"
    @mousemove="dragResizeMouseMove"
    @touchstart="dragResizeTouchDown"
  >
    <slot></slot>
  </div>
</template>

<script>
import DragResizeBase from "./components/vue-draggable-resizable.vue"; //"vue-draggable-resizable";
import $ from "jquery";

export default {
  name: "DragResize",
  extends: DragResizeBase,
  props: {
    borders: {
      type: Array,
      default: () => ["e", "s", "w", "n"],
      validator: val => {
        let borders = ["e", "s", "w", "n"],
          valid = true;
        val.forEach(p => {
          if (borders.indexOf(p) < 0) {
            valid = false;
            return false;
          }
        });
        return valid;
      }
    },
    borderResizeWidth: {
      type: Number,
      default: 10
    }
  },
  computed: {
    actualBorders() {
      if (!this.resizable) return [];
      return this.borders;
    }
  },
  methods: {
    dragResizeMouseDown(e) {
      this.dragResizeDown(e, true);
    },
    dragResizeTouchDown(e) {
      this.dragResizeDown(e, false);
    },
    getHandleToward(e) {
      let me = this,
        handle = false,
        el = me.$el,
        dom = $(el),
        off = dom.offset(),
        borderResizeWidth = me.borderResizeWidth,
        borders = me.actualBorders;
      let atRight =
          borders.indexOf("e") > -1
            ? e.pageX > off.left + el.offsetWidth - borderResizeWidth
            : false,
        atLeft =
          borders.indexOf("w") > -1
            ? e.pageX < off.left + borderResizeWidth
            : false,
        atTop =
          borders.indexOf("n") > -1
            ? e.pageY < off.top + borderResizeWidth
            : false,
        atBottom =
          borders.indexOf("s") > -1
            ? e.pageY > off.top + el.offsetHeight - borderResizeWidth
            : false,
        allAt = [atRight, atLeft, atTop, atBottom],
        count = 0;

      allAt.forEach(function(a) {
        if (a) {
          ++count;
        }
      });
      //【1】没有点击到四个边上时
      if (count === 0) {
        handle = false;
      }
      //【2】仅一个边上的情况
      else if (count === 1) {
        if (atRight) {
          handle = "mr"; //这个作为 相应事件的 方向标识
        } else if (atLeft) {
          handle = "ml";
        } else if (atTop) {
          handle = "tm";
        } else if (atBottom) {
          handle = "bm";
        }
      }
      //【3】四个角上的情况
      else if (count === 2) {
        //右上
        if (atTop && atRight) {
          handle = "tr";
        }
        //右下
        else if (atBottom && atRight) {
          handle = "br";
        }
        //左下
        else if (atBottom && atLeft) {
          handle = "bl";
        }
        //左上
        else if (atTop && atLeft) {
          handle = "tl";
        }
      }
      return handle;
    },
    dragResizeDown(e, isMouse) {
      let me = this;
      if (me.resizable) {
        let handle = me.getHandleToward(e);
        if (handle) {
          if (isMouse) {
            me.handleDown(handle, e);
          } else {
            me.handleTouchDown(handle, e);
          }
          return;
        }
      }
      if (me.draggable) {
        if (isMouse) {
          me.elementMouseDown(e);
        } else {
          me.elementTouchDown(e);
        }
      }
    },
    //是否显示鼠标提示
    dragResizeMouseMove(e) {
      let me = this;
      if (me.resizable && !me.resizing && !me.dragging) {
        let el = me.$el,
          dom = $(el),
          off = dom.offset(),
          borderResizeWidth = me.borderResizeWidth,
          borders = me.actualBorders;
        let atRight =
            borders.indexOf("e") > -1
              ? e.pageX > off.left + el.offsetWidth - borderResizeWidth
              : false,
          atLeft =
            borders.indexOf("w") > -1
              ? e.pageX < off.left + borderResizeWidth
              : false,
          atTop =
            borders.indexOf("n") > -1
              ? e.pageY < off.top + borderResizeWidth
              : false,
          atBottom =
            borders.indexOf("s") > -1
              ? e.pageY > off.top + el.offsetHeight - borderResizeWidth
              : false,
          allAt = [atRight, atLeft, atTop, atBottom],
          count = 0;

        allAt.forEach(function(a) {
          if (a) {
            ++count;
          }
        });
        //【1】没有点击到四个边上时
        if (count === 0) {
          el.style.cursor = "default";
        }
        //【2】仅一个边上的情况
        else if (count === 1) {
          if (atRight || atLeft) {
            el.style.cursor = "e-resize";
          } else if (atTop || atBottom) {
            el.style.cursor = "n-resize";
          }
        }
        //【3】四个角上的情况
        else if (count === 2) {
          //右上 左下
          if ((atTop && atRight) || (atBottom && atLeft)) {
            el.style.cursor = "ne-resize";
          }
          //右下 左上
          else if ((atBottom && atRight) || (atTop && atLeft)) {
            el.style.cursor = "nw-resize";
          }
        }
      } //[if] resizeable
    } //mousemove Fn
  } //methods
};
</script>
