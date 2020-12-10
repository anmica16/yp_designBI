<template>
  <DragResizeMouse
    ref="dragNode"
    :parent="true"
    :w="isRoot && percentMode ? '100%' : recordData.style.width"
    :h="recordData.style.height"
    :x="isRoot ? 0 : recordData.style.left || 0"
    :y="isRoot ? 0 : recordData.style.top || 0"
    :z="isRoot ? 0 : recordData.style.zIndex || 0"
    :widthMode="percentMode ? 'per' : ''"
    :leftMode="percentMode ? 'per' : ''"
    :dragFlag="recordData.drag_resize_cfg.can_drag"
    :draggable="!isRoot && recordData.drag_resize_cfg.can_drag != ''"
    :dropFlag="recordData.drag_resize_cfg.can_drop"
    :canDragTo="canDragTo"
    :dropable="canDrop"
    :resizable="!isRoot && recordData.drag_resize_cfg.can_resize"
    class="BubbleDragResize"
    :class="{ ...recordData.class, isRoot }"
  >
    <div ref="host" :is="xtype" v-bind="propsData"></div>
    <div v-if="!isRoot" class="attachTool" @mousedown.stop @touchstart.stop>
      <el-button>提示</el-button>
      <el-button>实例信息</el-button>
      <el-button @click="deleteFn">删除</el-button>
    </div>
  </DragResizeMouse>
</template>

<script>
import Vue from "vue";
import tool from "@/plugins/js/tool";
import { Instance } from "@designBI/views/mixins/Entity.js";
import dropManager from "@designBI/views/drawer/dropManager";
//像一个泡泡一样，可以到处移动，也可以拖拽等
export default {
  name: "Bubble",
  mixins: [Instance],
  props: {
    isRoot: {
      type: Boolean,
      default: false
    },
    //【1210】百分比模式，仅作用于 水平方向上w l
    percentMode: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      host: null
    };
  },
  computed: {
    canDrop() {
      //要看内部能不能Drop
      return this.host && this.host.canDrop;
    },
    canDragTo() {
      return this.recordData.drag_resize_cfg.can_dragTo;
    },
    itemsData() {
      return this.recordData.items;
    },
    propsData() {
      let me = this;
      return {
        //~1 直接放入prop
        ...me.recordData.propsData,
        //~2 剩余备用 传入
        Entity: me.Entity,
        //~3 source数据
        source: me.recordData.source,
        //# 1 百分比模式，按照自身来
        percentMode: me.percentMode
      };
    },
    //【update】mixin
    dropManager() {
      return dropManager;
    }
  },
  methods: {
    //拖拽层的 save调用
    save() {
      let me = this;
      //~ 1 拖拽的 style数据同步进去
      me.syncStyle();

      //~ 2 进行save;
      return new Promise((res, rej) => {
        me.Instance.save()
          .then(r => {
            res(r);
          })
          .catch(r => {
            rej(r);
          });
      });
    },
    deleteFn() {
      let me = this;

      me.$msgbox({
        showCancelButton: true,
        type: "warning",
        message: "确认删除该子控件？",
        title: "确认"
      })
        .then(() => {
          me.Instance.delete();
        })
        .catch(() => {});
    },
    syncStyle() {
      let me = this;
      let style = me.$refs.dragNode && me.$refs.dragNode.getSyncStyle();
      if (style) {
        me.Instance.setData({
          style
        });
      }
    }
  },

  //【update】mixin
  mounted() {
    let me = this;

    //@ 0 host设定
    me.host = me.$refs.host;

    //@ 1 如果是可drop进去的
    if (me.canDrop) {
      dropManager.set(me, me.$refs.dragNode);
    }
    //@ 2 正常的 松开手指 drop判定
    me.$refs.dragNode.$on("dragstop", function(e, dragNode) {
      //~ 2 先将对应的 style放入
      me.syncStyle();

      //~ 1 看看能不能拽入进去，随后就save
      me.dropManager
        .checkDragStop(e, me, dragNode)
        .then(result => {
          if (!(result && result.type === "add")) {
            console.error(["不会到达这里 dragstop then save"]);
            me.save();
          }
        })
        .catch(result => {
          if (result && result.type === "notFind") {
            //console.log(["未找到合适的parent加入！"]);
            me.save();
          }
        });
      // .finally(() => {
      //   console.log(["dragstop 的 保存！"]);
      //   me.save();
      // });
    });
    //@ 2-2 resize 松开手指
    me.$refs.dragNode.$on("resizestop", function(e, dragNode) {
      //~ 2 先将对应的 style放入
      me.syncStyle();
      //~ 1 看看能不能拽入进去，随后就save
      me.dropManager.checkResizeStop(e, me, dragNode).finally(() => {
        console.log(["resizestop 的 保存！"]);
        me.save();
      });
    });
    //@ 3 对style进行补充
    me.syncStyle();
  }
};
</script>

<style lang="scss">
.BubbleDragResize {
  &:not(.isRoot) {
    border: 1px dashed rgb(161, 193, 226);
  }
  // &.isRoot {
  //   background: azure;
  // }
  > .attachTool {
    position: absolute;
    left: 100%;
    top: 0;
  }
}
</style>
