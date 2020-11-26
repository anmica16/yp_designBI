<template>
  <DragResizeMouse
    ref="dragDom"
    :draggable="recordData.drag_resize_cfg.can_drag"
    :resizable="recordData.drag_resize_cfg.can_resize"
    :dropable="recordData.drag_resize_cfg.can_drop"
    class="BubbleDragResize"
    :class="recordData.class"
  >
    <!-- <div
      class="test"
      style="width: 100%; height: 100%; background: blue"
      @mousedown.stop="mousedownFn"
      @touchstart.stop
    >
      测试区域
    </div> -->
    <div ref="slot"></div>
    <div class="attachTool" @mousedown.stop @touchstart.stop>
      <el-button>提示</el-button>
      <el-button>实例信息</el-button>
    </div>
  </DragResizeMouse>
</template>

<script>
import Vue from "vue";
import tool from "@/plugins/js/tool";
// import DesignItem from "@designBI/store/Entity/DesignItem.js";
// import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance";
//像一个泡泡一样，可以到处移动，也可以拖拽等
export default {
  name: "Bubble",
  props: {
    //#1 必须传递，且实例依照该rec进行展现，改变的地方也在外面，由外至内部改变
    recordData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      //slotStr: tool.uniqueStr()
      host: null
    };
  },
  computed: {
    instanceCode() {
      return this.recordData.instanceCode;
    },
    xtype() {
      return this.recordData.xtype;
    },
    propsData() {
      let me = this;
      return {
        //~1 直接放入prop
        ...me.recordData.propsData,
        //~2 剩余备用 传入
        recordData: me.recordData
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
    me.$refs.dragDom.decodeStyle(me.recordData.style);
    //#2 加入到自身
    let xtypeCrt = Vue.options.components[me.xtype];
    if (xtypeCrt) {
      me.host = new xtypeCrt({
        propsData: me.propsData,
        el: me.$refs.slot
      });
    }
    //#3 事件
    me.$emit("mounted", me, me.host);
  }
};
</script>

<style lang="scss">
.BubbleDragResize {
  > .attachTool {
    position: absolute;
    left: 100%;
    top: 0;
  }
}
</style>
