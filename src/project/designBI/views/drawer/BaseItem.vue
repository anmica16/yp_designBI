<template>
  <DragResizeDom :draggable="!!drag" :resizable="resize">
    <div class="draw-item-base" :is="xtype" :record="record">
      <template v-for="(item, i) in items">
        <div :key="i" :is="item.xtype" :record="item"></div>
      </template>
    </div>
  </DragResizeDom>
</template>

<script>
import dropManager from "./dropManager";
export default {
  props: {
    // 1.2 附带什么属性，不用特地分开
    record: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    // ## 自身
    drag() {
      let me = this,
        cfg = me.drag_resize_cfg;
      return cfg.can_drag;
    },
    drop() {
      let me = this,
        cfg = me.drag_resize_cfg;
      return cfg.can_drop;
    },
    resize() {
      let me = this,
        cfg = me.drag_resize_cfg;
      return cfg.can_resize;
    },

    // 1.1 是什么
    xtype() {
      return this.record.xtype;
    },

    // 2 子集，
    items() {
      let me = this,
        item_instanceCodes = me.record.item_instanceCodes;

      return item_instanceCodes;
    }
  },
  mounted() {
    let me = this;
    if (me.drop) {
      dropManager.add(me);
    }
    me.record.$vNode = me;
  }
};
</script>
