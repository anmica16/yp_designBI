<template>
  <div class="BIBase">
    <div class="chartTitle">BIBase</div>
    <div class="chartBody">
      <ChartManager
        ref="chart"
        v-if="SummaryData"
        :SummaryData="SummaryData"
        :Dims="Dims"
        :Indices="Indices"
      ></ChartManager>
    </div>
  </div>
</template>

<script>
import { Instance } from "../mixins/Entity";

//【1】要求必有 数据
export default {
  name: "BIBase",
  mixins: [Instance],
  data() {
    return {
      SummaryData: null
    };
  },
  computed: {
    dimension() {
      return this.SummaryData && this.SummaryData.dimension;
    },
    Dims() {
      let me = this,
        dims = [];
      if (me.dimension) {
        dims.push(me.dimension[0]);
      }
      return dims;
    },
    Indices() {
      let me = this,
        dims = [];
      if (me.dimension) {
        dims = me.dimension.slice(1);
      }
      return dims;
    }
  },
  mounted() {
    let me = this,
      dataId = me.recordData.linkDataId;
    console.log(["查看数据？"]);
    //~ 1 数据
    me.EditNode.getLinkData(dataId).then(sumData => {
      if (sumData) {
        me.SummaryData = sumData;
      }
    });
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
