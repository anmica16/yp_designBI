<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
import tool from "@/plugins/js/tool";
import chartBase from "../chartBase";
import chartCommon from "./chartCommon";
export default {
  name: "chart-line",
  mixins: [chartBase, chartCommon],
  computed: {
    //%% 1 各type所需--类目（维度）
    xAxis() {
      let x = { type: "category" };
      // if (this.dimension && this.dimension.length) {
      //   let cDim = this.getAxisDim(this.dimension[0]);
      //   cDim && (x = cDim);
      // }
      return x;
    },
    //%% 2 各type所需--类目值（指标）
    yAxis() {
      return {}; //this.Indices;
    },
    //%% 3 各type--option 中组合基本序列
    series() {
      let me = this,
        series = [];
      me.dimension &&
        me.dimension.forEach((index, i) => {
          if (i < 1) return;
          let s = {
            type: me.chartType,
            name: index.key,
            encode: {
              x: me.xAxis.key || 0,
              y: index.key
            }
          };
          series.push(s);
        });
      return series;
    },
    //%% 4 各type--option组合
    option() {
      let me = this,
        option = {
          //# 2 小组件
          legend: {
            data: me.series.map(index => {
              return index.name;
            })
          },
          tooltip: {},

          //# 1 核心部分
          dataset: {
            source: me.keySheet
          },
          xAxis: me.xAxis,
          yAxis: me.yAxis,
          series: me.series
        };

      return option;
    }
  }
};
</script>
