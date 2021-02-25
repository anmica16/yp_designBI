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
let echarts = require("echarts");
import chartCommon from "./chartCommon";
export default {
  name: "chart-bar-stack",
  mixins: [chartCommon],
  computed: {
    seriesType() {
      return "bar";
    },
    series() {
      let me = this,
        series = [];
      me.Indices.forEach(index => {
        let name =
            me._joinTables && me._joinTables.length ? index.tName : index.key,
          s = {
            type: me.seriesType,
            name: index.chineseName || name,
            stack: "总量",
            label: {
              show: true
            },
            emphasis: {
              focus: "series"
            },
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgba(0, 221, 255)"
                },
                {
                  offset: 1,
                  color: "rgba(77, 119, 255)"
                }
              ])
            },
            encode: {
              x: me.Dims.length ? me.Dims[0].realKey : 0,
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
              type: "cross",
              label: {
                backgroundColor: "#6a7985"
              }
            }
          },

          //# 1 核心部分
          dataset: {
            source: me.aoaData
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
