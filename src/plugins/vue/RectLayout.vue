<template>
  <div class="rectWrap" :style="style">
    <div class="rectHolder">
      <div
        v-for="(item, i) in rItems"
        :style="rectStyle(item, i)"
        class="rectItem"
        :key="i"
        :is="item.xtype || 'div'"
        :data_r="item.data || { default: true }"
      ></div>
    </div>
  </div>
</template>

<script>
import RectLayout from "../js/RectLayout";
import tool from "../js/tool";
export default {
  data() {
    return {
      queryFlag: "RectLayout",
      style: {},
      layout: {}
    };
  },
  props: ["config"],
  methods: {
    rectStyle(item) {
      let style = [
        "width:" + item.vWidth || 0,
        "height:" + item.vHeight || 0,
        "top:" + item.top || 0,
        "left:" + item.left || 0
      ].join(";\n");
      return style;
    },
    resize() {
      console.log(["重新计算！"]);
      this.layout.reCalcWHTL();
    }
  },
  computed: {
    rItems() {
      let items = this.config.items,
        realItems = [];

      //【=3=】各个子项的高宽 初始响应
      items.forEach(function(item) {
        let oneItem = Object.assign({}, item);
        oneItem.width = item.width || 0;
        oneItem.height = item.height || 0;
        oneItem.top = item.top || 0;
        oneItem.left = item.left || 0;
        oneItem.vWidth = item.width;
        oneItem.vHeight = item.height;
        realItems.push(oneItem);
      });
      //console.log(["rItems的 计算值", realItems]);

      return realItems;
    }
  },
  created() {
    let me = this,
      config = me.config,
      style = config.style || {};

    //【=1=】方环型布局 四角配置
    let lay_base = {
      //【1】【可配置】默认左上、右上、左下、右下 四个角的归属，默认为 上 or 下
      nw: "n", //左上 默认归于 上方，一般标题占 100%宽度
      ne: "n", //右上 默认归于 上方，一般标题占 100%宽度
      sw: "s", //左下 默认归于 下方，一般底部占 100%宽度
      se: "s" //右下 默认归于 下方，一般底部占 100%宽度
    };
    let lay_cfg = tool.applyIf(
      {},
      {
        nw: config.nw,
        ne: config.ne,
        sw: config.sw,
        se: config.se
      },
      lay_base
    );
    this.layout = new RectLayout(lay_cfg);

    //【=2=】整体大小
    Object.assign(me.style, style);
    //console.log(["初始化"]);
    this.layout.makeLayout(this.rItems);
  },
  watch: {
    rItems() {
      //console.log(["变化监听到了吗？", arguments]);
      this.layout.makeLayout(this.rItems, true);
    }
  },
  mounted() {
    Object.assign(this.layout, {
      vNode: this
    });
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
