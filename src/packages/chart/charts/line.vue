<template>
  <div class="echartsBoxWrap">
    <div
      v-show="hasDimension"
      class="echartsBox"
      ref="box"
      style="width: 100%; height: 100%;"
    ></div>

    <div v-show="!hasDimension" class="noDimensionTip">
      <div class="back"></div>
      <div class="text">请先进入修改界面添加维度指标</div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import chartCommon from "./chartCommon";
export default {
  name: "chart-line",
  mixins: [chartCommon],
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
      me.Indices &&
        me.Indices.forEach((index, i) => {
          //if (i < 1) return;
          let name =
              me._joinTables && me._joinTables.length ? index.tName : index.key,
            s = {
              type: me.chartType,
              name: name,
              label: {
                show: true,
                position: "top"
              },
              encode: {
                x: me.xAxis.key || 0,
                y: name
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
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "line" // 默认为直线，可选为：'line' | 'shadow'
            }
          },

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
