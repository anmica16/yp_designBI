<template>
  <div class="BIBase">
    <div class="chartTitle">BIBase</div>
    <div class="chartBody">
      <div
        ref="chart"
        :is="chartTypeStr"
        :Entity="Instance"
        :EditNode="EditNode"
        :nowBoard="nowBoard"
        @click.native.stop
        @mousedown.native.stop
      ></div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import { Instance } from "../mixins/Entity";

//【1】要求必有 数据
export default {
  name: "BIBase",
  mixins: [Instance],
  computed: {
    //……1 这里的chartType是放在 Instance里面的
    chartTypeStr() {
      //console.log(["chartType被吃了？"]);
      return "chart-" + this.chartType;
    }
  },
  methods: {
    chartResize() {},
    refreshSource() {
      this.$refs.chart.refreshSource();
    }
  },
  mounted() {
    let me = this;
    me.$on("bubble-resize", () => {
      //console.log(["测试转化得如何了"]);
      let chart = me.$refs.chart;
      if (chart && tool.isFunction(chart.resize)) {
        chart.resize();
      }
    });
  }
};
</script>

<style lang="scss">
.BIBase {
  height: 100%;
  background: white;
  $h_title: 26px;
  > .chartTitle {
    height: $h_title;
  }
  > .chartBody {
    height: calc(100% - #{$h_title});
  }
}
</style>
