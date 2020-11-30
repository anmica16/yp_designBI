<template>
  <DragResizeMouse
    ref="dragDom"
    :parent="true"
    :w="isRoot ? '100%' : recordData.style.width"
    :h="isRoot ? '100%' : recordData.style.height"
    :x="isRoot ? 0 : recordData.style.left"
    :y="isRoot ? 0 : recordData.style.top"
    :dragFlag="recordData.drag_resize_cfg.can_drag"
    :draggable="!isRoot && recordData.drag_resize_cfg.can_drag != ''"
    :dropFlag="recordData.drag_resize_cfg.can_drop"
    :dropable="canDrop"
    :resizable="!isRoot && recordData.drag_resize_cfg.can_resize"
    class="BubbleDragResize"
    :class="{ ...recordData.class, isRoot }"
  >
    <!-- <div
      class="test"
      style="width: 100%; height: 100%; background: blue"
      @mousedown.stop="mousedownFn"
      @touchstart.stop
    >
      测试区域
    </div> -->
    <!-- <div ref="slot"></div> -->
    <div :is="xtype" v-bind="propsData"></div>
    <div v-if="!isRoot" class="attachTool" @mousedown.stop @touchstart.stop>
      <el-button>提示</el-button>
      <el-button>实例信息</el-button>
    </div>
  </DragResizeMouse>
</template>

<script>
import Vue from "vue";
import tool from "@/plugins/js/tool";
import { Instance } from "@designBI/views/mixins/Entity.js";
// import DesignItem from "@designBI/store/Entity/DesignItem.js";
// import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance";
//像一个泡泡一样，可以到处移动，也可以拖拽等
export default {
  name: "Bubble",
  mixins: [Instance],
  props: {
    isRoot: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      //slotStr: tool.uniqueStr()
      host: null
    };
  },
  computed: {
    canDrop() {
      return this.recordData.drag_resize_cfg.can_drop != "" && !this.host;
    },
    propsData() {
      let me = this;
      return {
        //~1 直接放入prop
        ...me.recordData.propsData,
        //~2 剩余备用 传入
        Entity: me.Entity,
        //~3 source数据
        source: me.recordData.source
      };
    }
  },
  methods: {
    mousedownFn() {
      //console.log(["mousedownFn执行"]);
    }
  },
  mounted() {
    let me = this;
    //#1 部分属性要放置进去
    //me.$refs.dragDom.decodeStyle(me.recordData.style);
    //#2 加入到自身
    // let xtypeCrt = Vue.options.components[me.xtype];
    // if (xtypeCrt) {
    //   me.host = new xtypeCrt({
    //     propsData: me.propsData,
    //     el: me.$refs.slot,
    //   });
    // }
    //#3 事件
    me.$emit("mounted", me, me.host);
  }
};
</script>

<style lang="scss">
.BubbleDragResize {
  &:not(.isRoot) {
    border: 1px dashed rgb(161, 193, 226);
  }
  &.isRoot {
    background: azure;
  }
  > .attachTool {
    position: absolute;
    left: 100%;
    top: 0;
  }
}
</style>
