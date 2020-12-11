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
    :class="{ ...recordData.class, isRoot, isHover, isSelect }"
    @mouseover.native.stop="mouseoverFn"
    @mouseleave.native="mouseleaveFn"
    @mousedown.native="mousedownFn"
  >
    <!-- <div
      class="hostWrap-withLineDot"
    > -->
    <div
      ref="host"
      class="hostWrap"
      :class="{ isRoot }"
      :is="xtype"
      v-bind="propsData"
    ></div>
    <!-- </div> -->

    <div
      v-if="!isRoot"
      v-show="isSelect"
      class="attachTool"
      @mousedown.stop
      @touchstart.stop
    >
      <div class="toolLayer">
        <el-button>提示</el-button>
        <el-button>实例信息</el-button>
        <el-button @click="deleteFn">删除</el-button>
      </div>
    </div>

    <div v-if="!isRoot" v-show="isSelect || isHover" class="attachBorder">
      <!-- 线 -->
      <div class="line line-left"></div>
      <div class="line line-top"></div>
      <div class="line line-right"></div>
      <div class="line line-bottom"></div>
      <!-- 点 -->
      <div class="dot dot-left"></div>
      <div class="dot dot-top"></div>
      <div class="dot dot-right"></div>
      <div class="dot dot-bottom"></div>
      <div class="dot dot-lt"></div>
      <div class="dot dot-rt"></div>
      <div class="dot dot-lb"></div>
      <div class="dot dot-rb"></div>
    </div>
  </DragResizeMouse>
</template>

<script>
import Vue from "vue";
import tool from "@/plugins/js/tool";
import { Instance } from "@designBI/views/mixins/Entity.js";
import dropManager from "@designBI/views/drawer/dropManager";
import selectManager from "@designBI/views/drawer/selectManager";
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
    //# 1 drop 拖拽 管理器
    dropManager() {
      return dropManager;
    },
    //# 2 item 切换 管理器
    selectManager() {
      return selectManager;
    },
    isHover() {
      return this.selectManager.hoverItem === this;
    },
    isSelect() {
      return this.selectManager.selectItem === this;
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
    },
    //# 1 切换 selectManager hover 的 this对象，以便属性菜单刷新
    //（1）优先级弱于 down
    mouseoverFn() {
      let me = this;
      //console.log(["咋不运行?"]);
      me.selectManager.changeHover(me);
    },
    mouseleaveFn() {
      let me = this;
      me.selectManager.changeHover(null);
    },
    //# 2 down 切换 selectManager select 的 this对象，以便属性菜单刷新
    //（1）是否按住ctrl ？ 帆软精致单个拖拽模式不用考虑多个的情况，反而复杂了
    mousedownFn() {
      let me = this;
      me.selectManager.changeSelect(me);
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
    //@ 4 item管理器的响应：
    // me.$on("hover-on", function() {

    // });
  }
};
</script>

<style lang="scss">
$blue: #35ace4;
.BubbleDragResize {
  // &:not(.isRoot) {
  //   border: 1px dashed rgb(161, 193, 226);
  // }
  //# 1 右上工具
  > .attachTool {
    position: absolute;
    left: 100%;
    top: 0;
  }
  //# 2 边界线 点
  > .hostWrap-withLineDot {
    height: 100%;
    width: 100%;
  }
  > .attachBorder {
    //~ 1 线
    .line {
      border: none;
      &-left {
        width: 1px;
        left: -1px;
        top: 0px;
        bottom: 0px;
        position: absolute;
        border-right: 1px dashed $blue;
      }
      &-top {
        height: 1px;
        left: 0px;
        right: 0px;
        top: -1px;
        position: absolute;
        border-bottom: 1px dashed $blue;
      }
      &-right {
        width: 1px;
        right: -1px;
        top: 0px;
        bottom: 0px;
        position: absolute;
        border-left: 1px dashed $blue;
      }
      &-bottom {
        height: 1px;
        left: 0px;
        right: 0px;
        bottom: -1px;
        position: absolute;
        border-top: 1px dashed $blue;
      }
    }
    //~ 2 点
    .dot {
      width: 6px;
      height: 6px;
      display: none;
      position: absolute;
      border-radius: 30px;
      background: $blue;

      &-left {
        left: -3px;
        top: 50%;
      }
      &-top {
        left: 50%;
        top: -3px;
      }
      &-right {
        right: -3px;
        top: 50%;
      }
      &-bottom {
        left: 50%;
        bottom: -3px;
      }
      &-lt {
        left: -3px;
        top: -3px;
      }
      &-rt {
        right: -3px;
        top: -3px;
      }
      &-lb {
        left: -3px;
        bottom: -3px;
      }
      &-rb {
        right: -3px;
        bottom: -3px;
      }
    }
  }
  &.isHover {
    > .attachBorder {
      .dot {
        display: block;
      }
    }
  }
  &.isSelect {
    > .attachBorder {
      .line {
        &-left {
          border-right: 1px solid $blue;
        }
        &-top {
          border-bottom: 1px solid $blue;
        }
        &-right {
          border-left: 1px solid $blue;
        }
        &-bottom {
          border-top: 1px solid $blue;
        }
      }
    }
  }
}
</style>
