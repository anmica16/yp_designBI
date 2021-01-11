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
      ></div>
    </div>
  </div>
</template>

<script>
import { Instance } from "../mixins/Entity";

//【1】要求必有 数据
export default {
  name: "BIBase",
  mixins: [Instance],
  computed: {
    chartTypeStr() {
      return "chart-" + this.chartType;
    }
  },
  mounted() {
    let me = this;
    me.$on("bubble-resize", () => {
      let chart = me.$refs.chart;
      if (chart) {
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
