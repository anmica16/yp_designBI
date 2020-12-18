<template>
  <div class="CellBubble">
    <Bubble
      v-for="item in items"
      :percentMode="percentMode"
      :key="item.recordData.instanceCode"
      :Entity="item"
      :cellItem="item.$$cellItem"
      :nowBoard="nowBoard"
    ></Bubble>
    <template v-for="shadow in addShadows"
      ><cells-shadow
        :key="shadow.cellItem.$key + '_s'"
        :style="{
          width: shadow.cellItem.width,
          height: shadow.cellItem.height + 'px',
          top: shadow.cellItem.top + 'px',
          left: shadow.cellItem.left
        }"
        v-if="shadow.show"
      ></cells-shadow>
    </template>

    <AbsItems ref="layout" :items="cellItems" :columnNumber="20"></AbsItems>
  </div>
</template>

<script>
import { Instance } from "@designBI/views/mixins/Entity.js";
import tool from "@/plugins/js/tool";
import CellsShadow from "./CellBubble/CellsShadow.vue";

//root专用 也可以是需要格子就用的
export default {
  components: { CellsShadow },
  name: "CellBubble",
  mixins: [Instance],
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
      layout: null
    };
  },
  computed: {
    //~ 1 原子watch 化多个为1个
    itemsWatchAtomicFn() {
      let me = this,
        itemsWatchAtomicFn = tool.atomic(me.itemsWatchBase, 100);
      return itemsWatchAtomicFn;
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
      //console.log(["在这步之后报错【结束】？", newVal]);
    },
    //【=2=】cell 位置同步！
    syncCellsMap(exceptItem) {
      exceptItem = exceptItem || {};
      let me = this;
      me.items &&
        me.items.forEach(item => {
          if (item.instanceCode !== exceptItem.$key) {
            item.syncCellStyle();
          }
        });
    }
  },
  mounted() {
    let me = this;
    //~ 2 布局
    me.layout = me.$refs.layout;
  }
};
</script>

<style lang="scss">
//因为大小由外部控制，所以默认向外部靠齐
.CellBubble {
  width: 100%;
  height: 100%;
  &:not(.isRoot) {
    background: white;
  }
}
</style>
