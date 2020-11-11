<template>
  <div class="rectWrap" :style="styleObj">
    <div class="rectHolder">
      <div
        class="n rectItem"
        v-if="layout['n']"
        :style="{
          width: (layout['n'] && layout['n'].vWidth) || 0,
          height: (layout['n'] && layout['n'].vHeight) || 0,
          top: (layout['n'] && layout['n'].top) || 0,
          left: (layout['n'] && layout['n'].left) || 0
        }"
      >
        <slot name="n"></slot>
      </div>
      <div
        class="w rectItem"
        v-if="layout['w']"
        :style="{
          width: (layout['w'] && layout['w'].vWidth) || 0,
          height: (layout['w'] && layout['w'].vHeight) || 0,
          top: (layout['w'] && layout['w'].top) || 0,
          left: (layout['w'] && layout['w'].left) || 0
        }"
      >
        <slot name="w"></slot>
      </div>
      <div
        class="c rectItem"
        v-if="layout['c']"
        :style="{
          width: (layout['c'] && layout['c'].vWidth) || 0,
          height: (layout['c'] && layout['c'].vHeight) || 0,
          top: (layout['c'] && layout['c'].top) || 0,
          left: (layout['c'] && layout['c'].left) || 0
        }"
      >
        <slot name="c"></slot>
      </div>
      <div
        class="e rectItem"
        v-if="layout['e']"
        :style="{
          width: (layout['e'] && layout['e'].vWidth) || 0,
          height: (layout['e'] && layout['e'].vHeight) || 0,
          top: (layout['e'] && layout['e'].top) || 0,
          left: (layout['e'] && layout['e'].left) || 0
        }"
      >
        <slot name="e"></slot>
      </div>
      <div
        class="s rectItem"
        v-if="layout['s']"
        :style="{
          width: (layout['s'] && layout['s'].vWidth) || 0,
          height: (layout['s'] && layout['s'].vHeight) || 0,
          top: (layout['s'] && layout['s'].top) || 0,
          left: (layout['s'] && layout['s'].left) || 0
        }"
      >
        <slot name="s"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import RectLayout from "@/plugins/js/RectLayout";
export default {
  name: "RectLayoutV2",
  props: {
    //【1】【可配置】默认左上、右上、左下、右下 四个角的归属，默认为 上 or 下
    nw: {
      type: String,
      default: "n"
    },
    ne: {
      type: String,
      default: "n"
    },
    sw: {
      type: String,
      default: "s"
    },
    se: {
      type: String,
      default: "s"
    },
    //【2】高宽
    width: {
      type: String,
      default: "100%"
    },
    height: {
      type: String,
      default: "100%"
    },
    //【3】方向上的高宽
    eWidth: {
      type: String,
      default: "150px"
    },
    wWidth: {
      type: String,
      default: "150px"
    },
    nHeight: {
      type: String,
      default: "100px"
    },
    sHeight: {
      type: String,
      default: "100px"
    }
  },
  data() {
    return {
      layout: null,
      items: null
    };
  },
  computed: {
    styleObj() {
      let me = this,
        obj = {
          width: me.width,
          height: me.height
        };
      return obj;
    },
    slotItems() {
      let me = this,
        items = [];
      tool.each(me.$slots, function(toward) {
        let item = {
          layoutAt: toward
        };
        if (toward === "e") {
          item.width = me["eWidth"];
        } else if (toward === "w") {
          item.width = me["wWidth"];
        } else if (toward === "n") {
          item.height = me["nHeight"];
        } else if (toward === "s") {
          item.height = me["sHeight"];
        }
        items.push(item);
      });

      return items;
    }
  },
  created() {
    let me = this,
      lay_cfg = {
        nw: me.nw,
        ne: me.ne,
        sw: me.sw,
        se: me.se
      };
    me.layout = new RectLayout(lay_cfg);
  },
  mounted() {
    let me = this;
    me.items = tool.clone(me.slotItems);
    me.layout.makeLayout(me.items);
    //console.log(["查看slot", me, me.$slots]);
  }
};
</script>

<style lang="scss" scoped>
.rectWrap {
  .rectHolder {
    position: relative;
    width: 100%;
    height: 100%;
    .rectItem {
      position: absolute;
      transition: all 0.5s ease-in-out;
    }
  }
}
</style>
