<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
import tool from "@/plugins/js/tool";
import chartCommon from "./chartCommon";
export default {
  name: "chart-bar-contrast",
  mixins: [chartCommon],
  computed: {
    seriesType() {
      return "bar";
    },
    yAxis() {
      let me = this,
        xKey = me.Dims.length ? me.Dims[0].realKey : null,
        xs = [],
        count = me.Indices.length;
      for (let i = 0; i < count; ++i) {
        let x = {
          gridIndex: i,
          type: "category",
          position: "left",
          boundaryGap: true,
          data: me.keySheet.map(rec => {
            return xKey ? rec[xKey] : "无维度";
          })
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
    xAxis() {
      let me = this,
        ys = [],
        count = me.Indices.length;
      for (let i = 0; i < count; ++i) {
        let y = {
          gridIndex: i,
          type: "value",
          inverse: i == 0 ? true : false
        };
        ys.push(y);
      }

      return ys;
    },
    grid() {
      let me = this,
        ys = [],
        count = me.Indices.length,
        divid = 80 / count;
      for (let i = 0; i < count; ++i) {
        let y = {
          left: `${(10 + divid * i).toFixed(1)}%`,
          right: `${(90 - divid * (i + 1)).toFixed(1)}%`
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
              y: me.Dims.length ? me.Dims[0].realKey : 0,
              x: name
            },
            label: {
              show: true,
              position: i > 0 ? "right" : "left"
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
            trigger: "axis",
            axisPointer: {
              type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
            }
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
