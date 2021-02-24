<template>
  <div class="CellBubble" :style="mapStyle">
    <Bubble
      v-for="item in items"
      :percentMode="percentMode"
      :key="item.recordData.instanceCode"
      :Entity="item"
      :cellItem="item.$$cellItem"
      :nowBoard="nowBoard"
      :EditNode="EditNode"
    ></Bubble>
    <template v-for="shadow in addShadows"
      ><cell-shadow
        :key="shadow.cellItem.$key + '_s'"
        :style="{
          width: shadow.cellItem.width,
          height: shadow.cellItem.height + 'px',
          top: shadow.cellItem.top + 'px',
          left: shadow.cellItem.left
        }"
        v-if="shadow.show"
      ></cell-shadow>
    </template>
    <template v-for="mask in addMasks"
      ><cell-mask
        :key="mask.cellItem.$key + '_m'"
        :style="mask.style"
        v-if="mask.show"
      ></cell-mask>
    </template>

    <AbsItems ref="layout" :items="cellItems" :columnNumber="20"></AbsItems>
  </div>
</template>

<script>
import { Instance } from "@designBI/views/mixins/Entity.js";
import DragResizeParent from "@designBI/views/mixins/DragResizeParent.js";
import tool from "@/plugins/js/tool";
import CellShadow from "./CellBubble/CellShadow.vue";
import CellMask from "./CellBubble/CellMask.vue";
import $ from "@/plugins/js/loader";
import Vue from "vue";

//root专用 也可以是需要格子就用的
export default {
  components: { CellShadow, CellMask },
  name: "CellBubble",
  mixins: [Instance, DragResizeParent],
  props: {
    //【1210】百分比模式，仅作用于 水平方向上w l；传递下去
    percentMode: {
      type: Boolean,
      default: function() {
        return true;
      }
    }
  },
  data() {
    return {
      //~ 1 影子cell 相对于子控件的布局
      cellItems: [],
      //~ 3 布局
      layout: null,
      updating: null
    };
  },
  computed: {
    //~ 1 原子watch 化多个为1个
    itemsWatchAtomicFn() {
      let me = this,
        itemsWatchAtomicFn = tool.atomic(me.itemsWatchBase, 100);
      return itemsWatchAtomicFn;
    },
    mapStyle() {
      let me = this,
        layout = me.layout,
        style = {};
      if (layout) {
        style.height = layout.cellsMap.length * layout.rowHeight + 105 + "px";
      }
      return style;
    }
  },
  watch: {
    //【=1-2=】多次触发
    items() {
      let me = this;
      me.itemsWatchAtomicFn.apply(me, arguments);
    }
  },
  methods: {
    //【=1=】包含初始化、变化响应的 cellItems的管理函数
    itemsWatchBase(newVal) {
      let me = this,
        //# 3 均为 cellItem，服务于
        newInses = [],
        addItems = [],
        removeItems = [];
      //console.log(["在这步之后报错？", newVal]);
      if (newVal && newVal.length) {
        //# 1 新加入 即 新的 在旧的找不到
        newVal.forEach(item => {
          if (
            me.cellItems.findIndex(i => {
              return i.$key === item.recordData.instanceCode;
            }) < 0
          ) {
            let style = item.recordData.style;
            let cItem = {
              $key: item.recordData.instanceCode,
              //# 4-1 添加一个引用
              $$instance: item,
              $$layout: me.layout,
              $$mapParent: me,

              //## 基本要素
              width: style.width,
              height: style.height,
              top: style.top,
              left: style.left
            };
            //# 4-2 添加一个引用
            item.$$cellItem = cItem;
            addItems.push(cItem);
          }
          if (item.$$newIns) {
            newInses.push(item);
          }
        });
        //# 2 看是否有删除的 旧的在 新的 找不到
        me.cellItems.forEach(i => {
          if (
            newVal.findIndex(item => {
              return i.$key === item.recordData.instanceCode;
            }) < 0
          ) {
            //# 4-3 解除双方引用
            delete i.$$instance.$$cellItem;
            delete i.$$instance;
            removeItems.push(i);
          }
        });
      }
      //# 5 然后触发一次 layout的更新，items的删除添加操作 交给 layout去进行
      if (removeItems.length || addItems.length) {
        //me.$emit("itemsAddRemove", addItems, removeItems);
        me.layout.itemsAddRemove(addItems, removeItems);
        me.syncCellsMap();
      }
      if (newInses.length) {
        me.saveCellsMap(newInses);
      }
      //console.log(["在这步之后报错【结束】？", newVal]);
    },
    //【=2=】cell 位置同步！
    syncCellsMap(exceptItem) {
      exceptItem = exceptItem || {};
      let me = this;
      //# 1 站在自己的角度看，保存这些
      me.items &&
        me.items.forEach(item => {
          if (item.instanceCode !== exceptItem.$key) {
            item.syncCellStyle();
          }
        });
    },
    //【=3=】保存上传！
    saveCellsMap(newInses = []) {
      let me = this,
        updItems = [],
        convertIns = function(ins) {
          let updInfo = {
            id: ins.recordData.id,
            style: ins.recordData.style
          };
          updItems.push(updInfo);
        };

      // ++ 2 添入
      newInses.forEach(ins => {
        convertIns(ins);
      });

      // ++ 1 store进度
      me.$store.state.progress = 0;
      me.layout.dealChangedItems(cItem => {
        if (cItem.$$instance) {
          convertIns(cItem.$$instance);
        }
      });
      me.$store.state.progress = 50;
      //# 2 同时map会有相同的记录，这里就消除记录，然后统一更新
      if (me.updating) {
        me.updating.abort();
        me.updating = null;
      }
      me.updating = $.ajax({
        url: Vue.Api.designBI,
        data: {
          method: Vue.Api.designBI.AddOrUpd,
          records: JSON.stringify(updItems),
          table: "item",
          isAdd: "-1"
        }
      });
      me.updating
        .then(result => {
          console.log(["成功的upd CellBubble", result]);
          me.updating = null;
          me.$store.state.progress = 100;
          me.$emit("save-success");
        })
        .catch(result => {
          console.log(["CellBubble 中断upd", arguments]);
          if (result && result.statusText === "abort") {
            me.$store.state.progress = 33;
          }
        });
    },
    checkResize() {
      let me = this;
      me.items &&
        me.items.forEach(item => {
          item.$bubble && item.$bubble.checkParentSize();
        });
    }
  },
  mounted() {
    let me = this;
    //~ 2 布局
    me.layout = me.$refs.layout;

    setTimeout(() => {
      //console.log(["开始check！"]);
      me.checkResize();
      setTimeout(() => {
        me.checkResize();
        setTimeout(() => {
          me.checkResize();
        }, 150);
      }, 150);
    }, 300);
  }
};
</script>

<style lang="scss">
//因为大小由外部控制，所以默认向外部靠齐
.CellBubble {
  width: 100%;
  height: 100%;
  min-height: 100%;
  &:not(.isRoot) {
    background: white;
  }
  &.isRoot {
    padding-bottom: 10px;
  }
}
</style>
