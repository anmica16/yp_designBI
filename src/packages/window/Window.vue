<template>
  <transition v-if="isShow">
    <PDR class="Window" v-bind="dragProps_pass" ref="dragDom">
      <template #title>
        <div class="Window-title">
          <div class="title-body">
            <slot v-if="title === true" name="title"></slot>
            <div v-if="title && title !== true">{{ title }}</div>
          </div>
          <div class="triggerArea">
            <span v-if="closeAble" class="close" @click="close">close</span>
          </div>
        </div>
      </template>
      <div class="Window-inner">
        <slot></slot>
      </div>
    </PDR>
  </transition>
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
    closeAble: {
      type: Boolean,
      default: true
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
  data() {
    return {
      isShow: true
    };
  },
  computed: {
    dragProps_pass() {
      let me = this;
      return tool.applyIf({}, me.dragProps, {
        title: true,
        w: me.width,
        h: me.height
      });
    }
  },
  methods: {
    close() {
      let me = this;
      me.$emit("close");
      me.isShow = false;
      //me.$el.remove();
      //me.$destroy();
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
    background: rgb(255, 255, 255);

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
