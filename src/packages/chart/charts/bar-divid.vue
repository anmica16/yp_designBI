<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
import tool from "@/plugins/js/tool";
import chartCommon from "./chartCommon";
export default {
  name: "chart-bar-divid",
  mixins: [chartCommon],
  computed: {
    seriesType() {
      return "bar";
    },
    xAxis() {
      let me = this,
        xs = [],
        count = me.Indices.length;
      for (let i = 0; i < count; ++i) {
        let x = {
          gridIndex: i
        };
        if (i > 0) {
          tool.apply(x, {
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            }
          });
        }
        xs.push(x);
      }

      return xs;
    },
    yAxis() {
      let me = this,
        ys = [],
        count = me.Indices.length;
      for (let i = 0; i < count; ++i) {
        let y = {
          gridIndex: i
        };
        ys.push(y);
      }

      return ys;
    },
    grid() {
      let me = this,
        ys = [],
        count = me.Indices.length,
        divid = 100 / count;
      for (let i = 0; i < count; ++i) {
        let y = {
          bottom: `${(divid * i).toFixed(1)}%`,
          top: `${(divid * (i + 1)).toFixed(1)}%`
        };
        ys.push(y);
      }

      return ys;
    },
    series() {
      let me = this,
        series = [];
      me.Indices.forEach((index, i) => {
        let name =
            me._joinTables && me._joinTables.length ? index.tName : index.key,
          s = {
            type: me.seriesType,
            name: name,
            encode: {
              x: me.xAxis.key || 0,
              y: name
            },
            xAxisIndex: i,
            yAxisIndex: i
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
            trigger: "axis"
          },
          grid: me.grid,

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
