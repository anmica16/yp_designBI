<template>
  <PDR class="Window" v-bind="dragProps_pass" ref="dragDom">
    <template #title v-if="title === true">
      <slot name="title"></slot>
    </template>
    <div class="Window-inner">
      <slot></slot>
    </div>
  </PDR>
</template>

<script>
import tool from "@/plugins/js/tool";
import PDR from "../drag-resize/components/panel-drag-resize";
export default {
  name: "Window",
  components: {
    PDR
  },
  props: {
    dragProps: {
      type: Object,
      default() {
        return {};
      }
    },
    title: {
      type: [Boolean, String],
      default() {
        return "标题";
      }
    },
    width: {
      type: [Number, String],
      default: "auto"
    },
    height: {
      type: [Number, String],
      default: "auto"
    }
  },
  computed: {
    dragProps_pass() {
      let me = this;
      return tool.applyIf({}, me.dragProps, {
        title: me.title,
        w: me.width,
        h: me.height
      });
    }
  }
};
</script>

<style lang="scss">
.Window {
  &.panel-drag-resize {
    border: 1px solid aliceblue;
    padding: 2px;
    border-radius: 5px;
    box-shadow: aliceblue 0px 0px 10px 0px;

    .dragArea {
      cursor: grab;
      border-bottom: 1px solid aliceblue;
      padding: 5px;
    }
    .Window-inner {
      padding: 5px;
    }
    &.dragging {
      .dragArea {
        cursor: grabbing;
      }
    }
  }
}
</style>
